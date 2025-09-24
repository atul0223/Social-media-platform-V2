 export type PostType = {
  isLiked: boolean;
  commentsCount: number;
  likesCount: number;
  postDetails: {
    _id: string;
    content: string;
    description: string;
    title: string;
  };
  publisherDetails: {
    username: string;
    profilePic: string;
  };
};
 export type CommentType = {
  _id: string;
  comment: string;
  commenterDetails: {
    username: string;
    profilePic: string;
  };
};
export type CurrentUserDetails ={
      _id:string,
      username:string,
      email:string,
      fullName:string,
      isPrivate:boolean,
      profilePic:string
}
export type Chat ={
  _id:string,
  chatName:string,
  pic:string,
  latestMessage:{
    content:string,
    sender:{username:string,profilePic:string}
  },
  users:[{
    _id:string,
    username:string,
    profilePic:string,
    email:string
  }]
}