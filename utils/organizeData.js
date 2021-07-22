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
  }
}
