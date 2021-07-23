module.exports = {
  getTweetData: (req, tweet) => {
    return {
      status: 'success',
      message: 'Get the tweet successfully',
      id: tweet.id,
      UserId: tweet.UserId,
      description: tweet.description,
      createdAt: tweet.createdAt,
      account: tweet.User.account,
      name: tweet.User.name,
      avatar: tweet.User.avatar,
      likedCount: tweet.Likes.length,
      repliedCount: tweet.Replies.length,
      isLike: tweet.LikedUsers.map(t => t.id).includes(req.user.id)
    }
  },
  getTweetsData: (req, tweets) => {
    tweets = tweets.map(tweet => {
      return {
        id: tweet.id,
        UserId: tweet.UserId,
        description: tweet.description,
        createdAt: tweet.createdAt,
        account: tweet.User.account,
        name: tweet.User.name,
        avatar: tweet.User.avatar,
        likedCount: tweet.Likes.length,
        repliedCount: tweet.Replies.length,
        isLike: tweet.LikedUsers.map(t => t.id).includes(req.user.id)
      }
    })
    return tweets
  },
  getRepliesData: (req, replies) => {
    replies = replies.map(reply => {
      return {
        id: reply.id,
        UserId: reply.UserId,
        TweetId: reply.TweetId,
        tweetAuthorAccount: reply.Tweet.User.account,
        comment: reply.comment,
        createdAt: reply.createdAt,
        commentAccount: reply.User.account,
        name: reply.User.name,
        avatar: reply.User.avatar
      }
    })
    return replies
  },
  getUsersData: (req, users) => {
    users = users.map(user => {
      let likedCount = 0
      user.Tweets.forEach(tweet => {
        likedCount += tweet.Likes.length
      })
      return {
        id: user.id,
        account: user.account,
        name: user.name,
        avatar: user.avatar,
        cover: user.cover,
        tweetCount: user.Tweets.length,
        likedCount,
        followingCount: user.Followings.length,
        followerCount: user.Followers.length
      }
    })
    users.sort((a, b) => b.tweetCount - a.tweetCount)
    return users
  },
  getSignInData: (token, user) => {
    user = {
      status: 'success',
      message: 'Sign in successfully.',
      token: token,
      user: {
        id: user.id,
        account: user.account,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        cover: user.cover,
        role: user.role
      }
    }
    return user
  },
  getCurrentUserData: (req) => {
    req = {
      id: req.user.id,
      name: req.user.name,
      account: req.user.account,
      email: req.user.email,
      avatar: req.user.avatar,
      role: req.user.role,
      cover: req.user.cover,
      introduction: req.user.introduction
    }
    return req
  },
  getTopUsersData: (req, users) => {
    users = users.map(user => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      account: user.account,
      followerCount: user.Followers.length,
      isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
    }))
    users = users.sort((a, b) => b.followerCount - a.followerCount)
    users.status = 'success'
    users.message = 'Get top ten users successfully'
    return users
  },
  getUserData: (req, user) => {
    user = {
      status: 'success',
      message: `Get @${user.account}'s  profile successfully.`,
      id: user.dataValues.id,
      name: user.dataValues.name,
      account: user.account,
      email: user.email,
      avatar: user.avatar,
      cover: user.cover,
      introduction: user.introduction,
      tweetCount: user.Tweets.length,
      followerCount: user.Followers.length,
      followingCount: user.Followings.length,
      isFollowed: user.Followers.map(d => d.id).includes(req.user.id)
    }
    return user
  },
  getUserTweetsData: (req, tweets) => {
    tweets = tweets.map(tweet => {
      return {
        id: tweet.id,
        UserId: tweet.UserId,
        description: tweet.description,
        createdAt: tweet.createdAt,
        account: tweet.User.account,
        name: tweet.User.name,
        avatar: tweet.User.avatar,
        likedCount: tweet.Likes.length,
        repliedCount: tweet.Replies.length,
        isLike: tweet.LikedUsers.map(t => t.id).includes(req.user.id)
      }
    })
    return tweets
  },
  getUserLikesData: (req, likes) => {
    likes = likes.map(like => {
      return {
        id: like.id,
        UserId: like.UserId,
        TweetId: like.TweetId,
        likeCreatedAt: like.createdAt,
        account: like.Tweet.User.account,
        name: like.Tweet.User.name,
        avatar: like.Tweet.User.avatar,
        description: like.Tweet.description,
        tweetCreatedAt: like.Tweet.createdAt,
        likedCount: like.Tweet.Likes.length,
        repliedCount: like.Tweet.Replies.length,
        isLike: like.Tweet.Likes.some((t) => t.UserId === req.user.id)
      }
    })
    return likes
  }
}
