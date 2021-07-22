module.exports = {
  getTweetData: (req, tweet) => {
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
  }
}
