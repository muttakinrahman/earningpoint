const User = require('../models/User');
const Message = require('../models/Message');
const Group = require('../models/Group');

// Fetch all direct chat users and groups consolidated, sorted by last message time
exports.getUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId);
    const followingIds = currentUser.following || [];

    // 1. Fetch Direct Users (only followed users or those with chat history)
    const messagedUserIds = await Message.distinct('sender', { receiver: currentUserId, group: { $exists: false } });
    const receivedUserIds = await Message.distinct('receiver', { sender: currentUserId, group: { $exists: false } });
    const relatedUserIds = [...new Set([
      ...followingIds.map(id => id.toString()),
      ...messagedUserIds.map(id => id.toString()),
      ...receivedUserIds.map(id => id.toString())
    ])];

    // Filter out blocked users (users we blocked OR users who blocked us)
    const blockedUserIds = currentUser.blockedUsers || [];
    const usersWhoBlockedMe = await User.find({ blockedUsers: currentUserId }, '_id');
    const blockedMeIds = usersWhoBlockedMe.map(u => u._id.toString());
    const excludeIds = [...new Set([...blockedUserIds.map(id => id.toString()), ...blockedMeIds])];

    const users = await User.find({ 
      _id: { $in: relatedUserIds, $ne: currentUserId, $nin: excludeIds } 
    }).select('name phoneOrEmail profilePic isPremium isEmailVerified verificationBadge username');

    const directChats = await Promise.all(users.map(async (u) => {
      const lastMsg = await Message.findOne({
        sender: { $in: [currentUserId, u._id] },
        receiver: { $in: [currentUserId, u._id] },
        group: { $exists: false }
      }).sort({ createdAt: -1 });

      const unreadCount = await Message.countDocuments({
        sender: u._id,
        receiver: currentUserId,
        isRead: false
      });

      return {
        _id: u._id,
        isGroup: false,
        name: u.name || u.phoneOrEmail || 'User',
        username: u.username || '',
        phoneOrEmail: '',
        profilePic: u.profilePic || '',
        isPremium: u.isPremium || false,
        isEmailVerified: u.isEmailVerified || false,
        verificationBadge: u.verificationBadge || (u.isEmailVerified ? 'blue' : 'none'),
        lastMessage: lastMsg ? lastMsg.content : '',
        lastMessageTime: lastMsg ? lastMsg.createdAt : null,
        lastMessageSender: lastMsg ? lastMsg.sender : null,
        isFollowing: followingIds.includes(u._id.toString()),
        unreadCount
      };
    }));

    // 2. Fetch Group Chats where user is a member
    const groups = await Group.find({ members: currentUserId });
    const groupChats = await Promise.all(groups.map(async (g) => {
      const lastMsg = await Message.findOne({ group: g._id })
        .sort({ createdAt: -1 })
        .populate('sender', 'name');

      const unreadCount = await Message.countDocuments({
        group: g._id,
        sender: { $ne: currentUserId },
        isRead: false
      });

      let lastMsgText = '';
      if (lastMsg) {
        const senderName = lastMsg.sender ? (lastMsg.sender.name || 'User') : 'User';
        lastMsgText = `${senderName}: ${lastMsg.content}`;
      }

      return {
        _id: g._id,
        isGroup: true,
        name: g.name,
        profilePic: g.profilePic || '',
        lastMessage: lastMsgText,
        lastMessageTime: lastMsg ? lastMsg.createdAt : null,
        lastMessageSender: lastMsg ? lastMsg.sender?._id : null,
        unreadCount
      };
    }));

    // 3. Consolidate and Sort by last message time
    const allChats = [...directChats, ...groupChats];
    allChats.sort((a, b) => {
      if (a.lastMessageTime && b.lastMessageTime) {
        return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
      }
      if (a.lastMessageTime) return -1;
      if (b.lastMessageTime) return 1;
      return a.name.localeCompare(b.name);
    });

    res.json(allChats);
  } catch (error) {
    console.error('Error fetching chat users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Fetch private message history with another user
exports.getChatHistory = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.otherUserId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ],
      group: { $exists: false },
      deletedFor: { $ne: currentUserId }
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name profilePic username isEmailVerified verificationBadge');

    // Mark messages received from this user as read
    const updateResult = await Message.updateMany(
      { sender: otherUserId, receiver: currentUserId, isRead: false },
      { $set: { isRead: true } }
    );

    if (updateResult && updateResult.modifiedCount > 0) {
      try {
        const socketIo = require('../socket');
        const io = socketIo.getIO();
        if (io) {
          io.to(otherUserId.toString()).emit('messages_read', { readerId: currentUserId.toString() });
        }
      } catch (socketErr) {
        // Ignore if socket not ready
      }
    }

    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new group chat
exports.createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    const currentUserId = req.user._id;

    if (!name || !members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: 'Group name and members are required' });
    }

    // Ensure creator is included in the members list
    const memberIds = [...new Set([...members, currentUserId.toString()])];

    const group = await Group.create({
      name,
      members: memberIds,
      createdBy: currentUserId,
    });

    res.status(201).json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Fetch group message history
exports.getGroupHistory = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const groupId = req.params.groupId;

    const messages = await Message.find({ 
      group: groupId,
      deletedFor: { $ne: currentUserId }
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name profilePic username isEmailVerified verificationBadge');

    // Mark group messages as read for this user
    await Message.updateMany(
      { group: groupId, sender: { $ne: currentUserId }, isRead: false },
      { $set: { isRead: true } }
    );

    res.json(messages);
  } catch (error) {
    console.error('Error fetching group history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update status note (24-hour expiration note)
exports.updateNote = async (req, res) => {
  try {
    const { note } = req.body;
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        note: note || '',
        noteCreatedAt: note ? new Date() : null,
      },
      { new: true }
    );

    res.json({ note: user.note, noteCreatedAt: user.noteCreatedAt });
  } catch (error) {
    console.error('Error updating status note:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get status notes of active users within 24 hours (only followed users, chat history, or yourself)
exports.getNotes = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId);
    const followingIds = currentUser.following || [];

    const messagedUserIds = await Message.distinct('sender', { receiver: currentUserId, group: { $exists: false } });
    const receivedUserIds = await Message.distinct('receiver', { sender: currentUserId, group: { $exists: false } });
    const relatedUserIds = [...new Set([
      ...followingIds.map(id => id.toString()),
      ...messagedUserIds.map(id => id.toString()),
      ...receivedUserIds.map(id => id.toString())
    ])];

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const users = await User.find({
      _id: { $in: [...relatedUserIds, currentUserId.toString()] },
      note: { $ne: '' },
      noteCreatedAt: { $gte: twentyFourHoursAgo }
    }).select('name profilePic note noteCreatedAt');

    res.json(users);
  } catch (error) {
    console.error('Error fetching active notes:', error);
    res.status(555).json({ message: 'Internal server error' });
  }
};

// Upload a file (image/audio) for a message
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const isImage = req.file.mimetype && req.file.mimetype.startsWith('image/');
    if (isImage) {
      const { optimizeUploadedFileToWebp } = require('../utils/imageOptimizer');
      const webpFilename = await optimizeUploadedFileToWebp(req.file.path, 2048, 2048, 92);
      return res.json({ filename: webpFilename || req.file.filename });
    }
    // Return audio/video/other file directly without image optimization
    res.json({ filename: req.file.filename });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── STORY FUNCTIONS ──────────────────────────────────────────────

// Add a new story (expires in 24 hours, max 10 per user)
exports.addStory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { text, emoji, bgGradient, textColor, fontStyle } = req.body;
    let imageFilename = '';
    if (req.file) {
      const { optimizeUploadedFileToWebp } = require('../utils/imageOptimizer');
      const webpFilename = await optimizeUploadedFileToWebp(req.file.path, 1920, 1920, 92);
      imageFilename = webpFilename || req.file.filename;
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Remove expired stories
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { stories: { createdAt: { $lt: twentyFourHoursAgo } } } },
      { new: true }
    );

    // Max 10 active stories per user
    if (user.stories.length >= 10) {
      return res.status(400).json({ message: 'Maximum 10 stories allowed at once' });
    }

    // Parse music if provided
    let parsedMusic = null;
    if (req.body.music) {
      try {
        parsedMusic = typeof req.body.music === 'string' ? JSON.parse(req.body.music) : req.body.music;
      } catch (e) {
        parsedMusic = null;
      }
    }

    // Push new story
    user.stories.push({
      text: text || '',
      emoji: emoji || '',
      image: imageFilename,
      bgGradient: bgGradient || 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
      textColor: textColor || '#ffffff',
      fontStyle: fontStyle || 'normal',
      music: parsedMusic || null,
      createdAt: new Date()
    });
    await user.save();

    const newStory = user.stories[user.stories.length - 1];
    res.status(201).json(newStory);
  } catch (error) {
    console.error('Error adding story:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a specific story by ID
exports.deleteStory = async (req, res) => {
  try {
    const userId = req.user._id;
    const storyId = req.params.storyId;

    await User.findByIdAndUpdate(userId, {
      $pull: { stories: { _id: storyId } }
    });

    res.json({ message: 'Story deleted' });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Record a view on a story
exports.recordStoryView = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const storyId = req.params.storyId;

    if (!storyId) {
      return res.status(400).json({ message: 'Story ID required' });
    }

    // Find the user who owns the story
    const storyOwner = await User.findOne({ 'stories._id': storyId });
    if (!storyOwner) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Don't record own views as a separate viewer
    if (storyOwner._id.toString() === currentUserId.toString()) {
      const selfStory = storyOwner.stories.id(storyId);
      return res.json({ 
        message: 'Own story view not counted', 
        viewsCount: selfStory?.viewers?.length || 0 
      });
    }

    const story = storyOwner.stories.id(storyId);
    if (!story) {
      return res.status(404).json({ message: 'Story item not found' });
    }

    const alreadyViewed = story.viewers && story.viewers.some(v => v.user?.toString() === currentUserId.toString());
    if (!alreadyViewed) {
      await User.updateOne(
        { 'stories._id': storyId },
        {
          $push: {
            'stories.$.viewers': {
              user: currentUserId,
              viewedAt: new Date()
            }
          }
        }
      );
    }

    const updatedOwner = await User.findOne({ 'stories._id': storyId }, { 'stories.$': 1 });
    const viewsCount = updatedOwner?.stories?.[0]?.viewers?.length || (story.viewers?.length || 0) + (alreadyViewed ? 0 : 1);

    res.json({ message: 'Story view recorded', viewsCount });
  } catch (error) {
    console.error('Error recording story view:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get list of viewers for a story (Only the story author can view)
exports.getStoryViewers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const storyId = req.params.storyId;

    const user = await User.findOne(
      { _id: currentUserId, 'stories._id': storyId },
      { 'stories.$': 1 }
    ).populate('stories.viewers.user', 'name username profilePic googleAvatar facebookAvatar isPremium');

    if (!user || !user.stories || user.stories.length === 0) {
      return res.status(404).json({ message: 'Story not found or unauthorized' });
    }

    const targetStory = user.stories[0];
    const rawViewers = targetStory.viewers || [];

    // Format viewers list (newest first)
    const formattedViewers = rawViewers
      .filter(v => v.user)
      .map(v => {
        const u = v.user;
        const pic = u.profilePic || u.googleAvatar || u.facebookAvatar || '';
        return {
          _id: u._id,
          name: u.name,
          profilePic: pic,
          isPremium: !!u.isPremium,
          viewedAt: v.viewedAt
        };
      })
      .reverse();

    res.json({
      storyId,
      viewsCount: formattedViewers.length,
      viewers: formattedViewers
    });
  } catch (error) {
    console.error('Error fetching story viewers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all active (24h) stories from following/chat users + yourself + active community users
exports.getStories = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId);
    const followingIds = currentUser?.following || [];

    const messagedUserIds = await Message.distinct('sender', { receiver: currentUserId, group: { $exists: false } });
    const receivedUserIds = await Message.distinct('receiver', { sender: currentUserId, group: { $exists: false } });
    const relatedUserIds = [...new Set([
      currentUserId.toString(),
      ...followingIds.map(id => id.toString()),
      ...messagedUserIds.map(id => id.toString()),
      ...receivedUserIds.map(id => id.toString())
    ])];

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const relatedUsers = await User.find({
      _id: { $in: relatedUserIds },
      'stories.0': { $exists: true }
    }).select('name profilePic googleAvatar facebookAvatar stories').populate('stories.viewers.user', 'name username profilePic googleAvatar facebookAvatar isPremium');

    const otherUsers = await User.find({
      _id: { $nin: relatedUserIds },
      'stories.0': { $exists: true }
    }).select('name profilePic googleAvatar facebookAvatar stories').limit(20);

    const allUsers = [...relatedUsers, ...otherUsers];

    // Filter expired stories and users with no active stories
    const result = allUsers.map(u => {
      const isSelf = u._id.toString() === currentUserId.toString();
      const userPic = u.profilePic || u.googleAvatar || u.facebookAvatar || '';
      const activeStories = (u.stories || []).filter(s => new Date(s.createdAt) >= twentyFourHoursAgo).map(s => {
        const viewers = s.viewers || [];
        return {
          _id: s._id,
          text: s.text,
          emoji: s.emoji,
          image: s.image,
          bgGradient: s.bgGradient,
          textColor: s.textColor,
          fontStyle: s.fontStyle,
          music: s.music,
          createdAt: s.createdAt,
          viewsCount: viewers.length,
          viewers: isSelf ? viewers.filter(v => v.user).map(v => {
            const vu = v.user;
            const vPic = vu.profilePic || vu.googleAvatar || vu.facebookAvatar || '';
            return {
              _id: vu._id || vu,
              name: vu.name || 'User',
              profilePic: vPic,
              isPremium: !!vu.isPremium,
              viewedAt: v.viewedAt
            };
          }).reverse() : []
        };
      });

      return {
        _id: u._id,
        name: u.name,
        profilePic: userPic,
        stories: activeStories
      };
    }).filter(u => u.stories.length > 0);

    res.json(result);
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /api/messages/chat/:otherUserId — Delete chat history with a user (User-facing)
exports.deleteChatHistory = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.otherUserId;

    const result = await Message.deleteMany({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ],
      group: { $exists: false }
    });

    res.json({ message: 'Chat history deleted successfully.', count: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/messages/report/:messageId — Report a specific chat message
exports.reportMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const { reason } = req.body;

    const AdminNotification = require('../models/AdminNotification');
    await AdminNotification.create({
      title: 'Message Reported 💬',
      message: `Message reported by user ID ${req.user._id}. Reason: ${reason || 'Inappropriate Content'}. Message content: "${message.content.substring(0, 100)}"`,
      type: 'support',
      referenceId: message._id.toString()
    });

    res.json({ message: 'Message reported successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/messages/send — Send a direct message
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId, content, messageType, replyTo } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver and content are required' });
    }

    // Block Check
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const isBlockedByReceiver = receiver.blockedUsers && receiver.blockedUsers.includes(senderId.toString());
    const isBlockedBySender = sender.blockedUsers && sender.blockedUsers.includes(receiverId.toString());
    if (isBlockedByReceiver || isBlockedBySender) {
      return res.status(403).json({ message: 'Message blocked: You have blocked this user or been blocked by them.' });
    }

    const savedMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: content,
      messageType: messageType || 'text',
      replyTo: replyTo || null
    });

    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('sender', 'name profilePic username isEmailVerified verificationBadge');

    // Broadcast via socket
    try {
      const io = require('../socket').getIO();
      if (io) {
        io.to(receiverId.toString()).emit('receive_direct_message', populatedMessage);
        io.to(senderId.toString()).emit('receive_direct_message', populatedMessage);
      }
    } catch (socketErr) {
      console.error('Failed to broadcast via socket:', socketErr);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /api/messages/:messageId/edit — Edit a sent message before seen
exports.editMessage = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== currentUserId.toString()) {
      return res.status(403).json({ message: 'You can only edit your own messages' });
    }

    if (message.isRead) {
      return res.status(400).json({ message: 'Cannot edit message after it has been seen' });
    }

    if (message.isUnsent) {
      return res.status(400).json({ message: 'Cannot edit an unsent message' });
    }

    message.content = content.trim();
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name profilePic username isEmailVerified verificationBadge');

    // Broadcast update via Socket.io
    try {
      const io = require('../socket').getIO();
      if (io) {
        if (message.group) {
          io.to(message.group.toString()).emit('message_edited', populatedMessage);
        } else {
          io.to(message.receiver.toString()).emit('message_edited', populatedMessage);
          io.to(message.sender.toString()).emit('message_edited', populatedMessage);
        }
      }
    } catch (socketErr) {
      console.error('Failed to broadcast edit via socket:', socketErr);
    }

    res.json(populatedMessage);
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

// DELETE /api/messages/message/:messageId — Delete a single message (for_me or for_everyone)
exports.deleteMessage = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const messageId = req.params.messageId;
    const { type } = req.query; // 'for_everyone' | 'for_me'

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (type === 'for_everyone') {
      // Only sender can unsend for everyone
      if (message.sender.toString() !== currentUserId.toString()) {
        return res.status(403).json({ message: 'You can only unsend your own messages for everyone' });
      }

      message.isUnsent = true;
      message.content = 'This message was unsent';
      message.messageType = 'text';
      await message.save();

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name profilePic username isEmailVerified verificationBadge');

      try {
        const io = require('../socket').getIO();
        if (io) {
          if (message.group) {
            io.to(message.group.toString()).emit('message_unsent', { messageId: message._id, updatedMessage: populatedMessage });
          } else {
            io.to(message.receiver.toString()).emit('message_unsent', { messageId: message._id, updatedMessage: populatedMessage });
            io.to(message.sender.toString()).emit('message_unsent', { messageId: message._id, updatedMessage: populatedMessage });
          }
        }
      } catch (socketErr) {
        console.error('Failed to broadcast unsend via socket:', socketErr);
      }

      return res.json({ message: 'Message unsent for everyone', updatedMessage: populatedMessage });
    } else {
      // Delete for Me
      if (!message.deletedFor.includes(currentUserId)) {
        message.deletedFor.push(currentUserId);
        await message.save();
      }

      return res.json({ message: 'Message deleted for you', messageId: message._id });
    }
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

// GET /api/messages/unread-count — Get total unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Direct unread messages received from others
    const directUnread = await Message.countDocuments({
      receiver: currentUserId,
      isRead: false,
      group: { $exists: false }
    });

    // Group unread messages where user is a member
    const userGroups = await Group.find({ members: currentUserId }, '_id');
    const groupIds = userGroups.map(g => g._id);
    const groupUnread = await Message.countDocuments({
      group: { $in: groupIds },
      sender: { $ne: currentUserId },
      isRead: false
    });

    const totalUnread = directUnread + groupUnread;
    res.json({ unreadCount: totalUnread, directUnread, groupUnread });
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
