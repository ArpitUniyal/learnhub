const { User, UserProgress, Topic, CompletedQuiz } = require('../models');

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: UserProgress,
          as: 'progress',
          include: [
            {
              model: Topic,
              attributes: ['id', 'title']
            }
          ]
        },
        {
          model: CompletedQuiz,
          as: 'completedQuizzes',
          include: [
            {
              model: Quiz,
              include: [
                {
                  model: Topic,
                  attributes: ['id', 'title']
                }
              ]
            }
          ],
          order: [['createdAt', 'DESC']],
          limit: 5
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update name if provided
    if (name) {
      user.name = name;
    }

    // Update email if provided
    if (email) {
      user.email = email;
    }

    // Update password if current password is provided and matches
    if (currentPassword && newPassword) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      user.password = newPassword;
    }

    await user.save();

    // Return updated user without password
    const updatedUser = user.toJSON();
    delete updatedUser.password;

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// Get user progress
exports.getUserProgress = async (req, res, next) => {
  try {
    const progress = await UserProgress.findAll({
      where: { userId: req.userId },
      include: [
        {
          model: Topic,
          attributes: ['id', 'title']
        }
      ]
    });

    res.json(progress);
  } catch (error) {
    next(error);
  }
};

// Get user's quiz history
exports.getQuizHistory = async (req, res, next) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    const history = await CompletedQuiz.findAndCountAll({
      where: { userId: req.userId },
      include: [
        {
          model: Quiz,
          include: [
            {
              model: Topic,
              attributes: ['id', 'title']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      total: history.count,
      quizzes: history.rows
    });
  } catch (error) {
    next(error);
  }
};
