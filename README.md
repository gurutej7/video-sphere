## Video-Sphere

- This is a Backend project focused on User authentication and **CRUD** operations on various data models including a video model.
- Developed user registration, login, subscription functionalities, and profile management, along with features for viewing
  and **uploading videos** , focusing on delivering seamless user experiences.
- **JWT** based authentication is implemented for user authorization and password encryption using **bcryptjs** library.
- Utilized **mongoDB aggregation pipelines** for implementing complex queries to the database such as getting user watch history,get all videos ,get video comments etc.
- Integrated **cloudinary** for efficient media (photos and videos) upload and management.
- Utilized **multer** library for accessing media files from the user requests.

### Run locally

Clone the project

```bash
  git clone https://github.com/gurutej7/video-sphere.git
```

- create `.env` file in the root and assign the following variables

```bash
  MONGO_URI=
  ACCESS_JWT_SECRET=
  ACCESS_JWT_LIFETIME=1d
  REFRESH_JWT_SECRET=
  REFRESH_JWT_LIFETIME=10d
  CLOUDINARY_CLOUD_NAME=
  CLOUDINARY_API_KEY=
  CLOUDINARY_API_SECRET=
  CLOUDINARY_URL=
```

Go to the project directory

```bash
  cd video-sphere
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm start
```

### Lessons learned

1. While working on this project, I practiced various backend logics, including data modelling, error handling, middlewares, RESTFul API , Authentication, dealing with database queries, etc.
2. One of the key learning points was understanding and applying MongoDB aggregation pipelines.

## API Routes

### For Users

- `/api/v1/users`

  -`/register`- POST - Registers an user

  -`/login`- POST - Logs in an user

  -`/logout`- POST - Logs out an user

  -`/change-password`- POST - Changes the password for the user

  -`/refresh-token`- POST - Generates new refresh token for the user

  -`/current-user`- GET - Gets the current user

  -`/watch-history`- GET - Gets the watch history of current user

  -`/channel/:username`- GET - Returns user channel profile

  -`/update-avatar`- PATCH - Updates the avatar of the user

  -`/update-cover-image`- PATCH - Updates the cover image of the user

  -`/update-account-details`- PATCH - Updates the account details of the user

### For Videos

- `/api/v1/videos`

  -`/publish-video`- POST - To upload the video

  -`/get-all-videos`- GET - To fetch all videos of the user

  -`/gwt-video/:videoId`- GET - To fetch the video by video ID

  -`/delete-video/:videoId`- DELETE - To delete the video

  -`/toggle-publish-status/:videoId`- POST - Toggle the publish status of a video

### For Channels

- `/api/v1/channels`

  -`/toggle-sub/:channelName`- POST - To toggle sub

  -`/is-sub/:channelName`- GET - To check whether current user is a sub of a particular channel or not

  -`/get-channel-profile/:channelName`- GET - To get the profile of a channel

### For playlists

- `/api/v1/playlists`

  -`/create-playlist`- POST - To create a new playlist

  -`/get-playlist/:username`- GET - To get all playlists of a particular user

  -`/add-video/:playlistId/:videoId`- PATCH - To add a video to a playlist

  -`/remove-video/:playlistId/:videoId`- PATCH - To remove a video to a playlist

  -`/:playlistId` - GET - To get a playlist by id

  -`/:playlistId` - DELETE - To Delete a playlist by id

  -`/:playlistId` - PATCH - To update details of a playlist (name and description)

### For Comments

- `/api/v1/comments`

  -`/:videoId`- POST - To create a new comment on a particular video

  -`/:videoId`- GET - To get comments of a video

  -`/:commentId` - PATCH - To update/edit the comment

  -`/:commentId` - DELETE - To Delete a comment

### For Likes

- `/api/v1/likes`

  -`/toggle-comment-like/:commentId`- POST - To toggle like of a comment

  -`/toggle-video-like/:videoId`- POST - To toggle like of a video

  -`/get-liked-videos` - GET - To get Liked videos of the current user

### For Dashboard

- `/api/v1/dashboard`

  -`/get-channel-stats`- GET - To get stats of the current user(sub count,like count etc..)

  -`/get-channel-videos`- GET - To get videos of the current user
