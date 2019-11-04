<!-- Comment System APIs -->
API endpoint exposed to to end user.
`http://<hot-name>/`
`comment/` - `GET` fetch all comments.
`comment/users` - `GET` fetch all users.
`comment/:userid` - `GET` fetch comments of a perticular user with its userid.
`comment/reply/:commentid` - `GET` fetch comment's reply by comment id. 
`comment/edit` - `PUT` edit user comment.
`comment/add` - `POST` save user comment.
`comment/reply` - `POST` save user reply.

<!-- Configuration -->
Create a saperate copy of `default.json.template` and 
Remove `.template` from `default.json.template` copy and configure the file accourding to your db settings.
