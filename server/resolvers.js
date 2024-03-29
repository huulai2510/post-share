const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('./config/dbUrl')
const createToken = (user, secret, expiresIn) => {
  const { username, email } = user;
  return jwt.sign({ username, email }, secret, { expiresIn })
}
module.exports = {
  Query: {
    getCurrentUser: async (_, args, { User, currentUser }) => {
      if (!currentUser) {
        return null
      }
      const user = await User.findOne({ username: currentUser.username }).populate({
        path: 'favorites',
        model: 'Post'
      })
      return user
    },
    getPosts: async (_, args, {Post}) => {
      const posts =
        await Post.find({}).sort({createdDate: 'desc'}).populate({
          path: 'createdBy',
          model: 'User'
        })
      return posts
    },
    getUserPosts: async (_, { userId }, { Post }) => {
      const posts = await Post.find({ createdBy: userId })
      return posts
    },
    getPost: async (_, { postId }, { Post }) => {
      const post = await Post.findOne({ _id: postId }).populate({
        path: 'messages.messageUser',
        model: 'User'
      })
      return post
    },
    searchPosts: async (_, { searchTerm }, { Post }) => {
      if (searchTerm) {
        const searchResults = await Post.find(
          { $text: { $search: searchTerm } },
          { score: { $meta: 'textScore'} }
        ).sort({
          score: { $meta: 'textScore' },
          likes: 'desc'
        })
        .limit(3)
        return searchResults
      }
    },
    infiniteScrollPosts: async (_, { pageNum, pageSize }, { Post }) => {
      let posts
      if (pageNum === 1) {
        posts = await Post.find({}).sort({ createdDate: 'desc' }).populate({
          path: 'createdBy',
          model: 'User'
        }).limit(pageSize)
      } else {
        const skips = pageSize * (pageNum -1)
        posts = await Post.find({}).sort({ createdDate: 'desc' }).populate({
          path: 'createdBy',
          model: 'User'
        }).skip(skips).limit(pageSize)
      }
      const totalDocs = await Post.countDocuments()
      const hasMore = totalDocs > pageSize * pageNum
      return { posts, hasMore }
    }
  },
  Mutation: {
    addPost: async (
        _,
        {title, imageUrl, categories, description, creatorId},
        {Post}
      ) => {
      const newPost = await new Post({
        title,
        imageUrl,
        categories,
        description,
        createdBy: creatorId
      }).save()
      return newPost
    },
    updateUserPost: async (
      _,
      { postId, userId, title, description, imageUrl, categories },
      { Post }
    ) => {
      const post = await Post.findOneAndUpdate(
        { _id: postId, createdBy: userId },
        { $set: {title, imageUrl, categories, description } },
        { new: true }
      )
      return post
    },
    deleteUserPost: async (_, { postId }, { Post }) => {
      const post = await Post.findOneAndRemove({ _id: postId })
      return post
    },
    addPostMessage: async (_, { messageBody, userId, postId }, { Post }) => {
      const newMessage = {
        messageBody,
        messageUser: userId
      }
      const post = await Post.findOneAndUpdate(
        { _id: postId },
        { $push: { messages: { $each: [newMessage], $position: 0 } } },
        { new: true }
      ).populate({
        path: 'messages.messageUser',
        model: 'User'
      })
      return post.messages[0]
    },
    likePost: async (_, { postId, username }, { Post, User }) => {
      const post = await Post.findOneAndUpdate(
        { _id: postId },
        { $inc: { likes: 1 } },
        { new: true }
      )

      const user = await User.findOneAndUpdate(
        { username },
        { $addToSet: { favorites: postId } },
        { new: true}
      ).populate({
        path: 'favorites',
        model: 'Post'
      })

      return { likes: post.likes, favorites: user.favorites }
    },
    unlikePost: async (_, { postId, username }, { Post, User }) => {
      const post = await Post.findOneAndUpdate(
        { _id: postId },
        { $inc: { likes: -1 } },
        { new: true }
      )

      const user = await User.findOneAndUpdate(
        { username },
        { $pull: { favorites: postId } },
        { new: true}
      ).populate({
        path: 'favorites',
        model: 'Post'
      })

      return { likes: post.likes, favorites: user.favorites }
    },
    signinUser: async(_, { password, username }, { User }) => {
      const user = await User.findOne({ username })
      if(!user) {
        throw new Error('user not found')
      }
      const isValidPassword = bcrypt.compareSync(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid password')
      }
      return { token: createToken(user, config.secret, '1hr')}
    },
    signupUser: async (_, {username, email, password}, {User}) => {
      const user = await User.findOne({username})
      if (user) {
        throw new Error('User already exists')
      }
      const newUser = await new User({
        username,
        email,
        password
      }).save()
      return { token: createToken(newUser, config.secret, '1hr')}
    }
  }
}