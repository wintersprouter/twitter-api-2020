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
    return tweets = tweets.map(tweet => {
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
  },
  getRepliesData: (req, replies) => {
    return replies = replies.map(reply => {
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
    getSignInUser = {
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
    return getSignInUser
  }
}
