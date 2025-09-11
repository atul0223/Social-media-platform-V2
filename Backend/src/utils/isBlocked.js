import User from "../models/user.model.js"

const isBlockedByTargetUser =async (currentUserId,targetUserId)=>{
    const targetUser = User.findById(targetUserId)
    if (targetUser.blockedUsers.includes(currentUserId)) {
        return true
    }
    else{
        return false
    }
}
const isBlockedByCurrentUser =async(currentUserId,targetUserId)=>{
    const currentUser = User.findById(currentUserId)
    if (currentUser.blockedUsers.includes(targetUserId)) {
        return true
    }
    else{
        return false
    }
}
export {isBlockedByTargetUser ,isBlockedByCurrentUser};