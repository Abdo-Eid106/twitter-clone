const createPostHtml = (postData, largeFont = false) => {
	if (postData == null) return alert("post object is null");

	var isRetweet = postData.retweetData !== undefined;
	var retweetedBy = isRetweet ? postData.postedBy.username : null;
	postData = isRetweet ? postData.retweetData : postData;

	var postedBy = postData.postedBy;

	if (postedBy._id === undefined) {
		return console.log("User object not populated");
	}

	var displayName = postedBy.firstName + " " + postedBy.lastName;

	var likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : "";
	var retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : "";
	var largeFontClass = largeFont ? "largeFont" : "";

	var retweetText = '';
	if (isRetweet) {
		retweetText = `<span>
                        <i class='fas fa-retweet'></i>
                        Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>    
                    </span>`
	}

	var replyFlag = "";
	if (postData.replyTo && postData.replyTo._id) {

		if (!postData.replyTo._id) {
			return alert("Reply to is not populated");
		} else if (!postData.replyTo.postedBy._id) {
			return alert("Posted by is not populated");
		}

		var replyToUsername = postData.replyTo.postedBy.username;
		replyFlag = `<div class='replyFlag'>
                        Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}<a>
                    </div>`;

	}

	var buttons = "";
	var pinnedPostText = "";
	if (postData.postedBy._id == userLoggedIn._id) {

		var pinnedClass = "";
		var dataTarget = "#confirmPinModal";
		if (postData.pinned === true) {
			pinnedClass = "active";
			dataTarget = "#unpinModal";
			pinnedPostText = "<i class='fas fa-thumbtack'></i> <span>Pinned post</span>";
		}

		buttons = `<button class='pinButton ${pinnedClass}' data-id="${postData._id}" data-toggle="modal" data-target="${dataTarget}"><i class='fas fa-thumbtack'></i></button>
                    <button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class='fas fa-times'></i></button>`;
	}

	return `<div class='post ${largeFontClass}' data-id='${postData._id}'>
                <div class='postActionContainer'>
                    ${retweetText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='pinnedPostText'>${pinnedPostText}</div>
                        <div class='header'>
                            <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                            <span class='username'>@${postedBy.username}</span>
                            <span class='date'>${postData.timeFormated}</span>
                            ${buttons}
                        </div>
                        ${replyFlag}
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>
                        <div class='postFooter'>
                            <div class='postButtonContainer'>
                                <button data-toggle='modal' data-target='#replyModal'>
                                    <i class='far fa-comment'></i>
                                </button>
                            </div>
                            <div class='postButtonContainer green'>
                                <button class='retweetButton ${retweetButtonActiveClass}'>
                                    <i class='fas fa-retweet'></i>
                                    <span>${postData.retweetUsers.length || ""}</span>
                                </button>
                            </div>
                            <div class='postButtonContainer red'>
                                <button class='likeButton ${likeButtonActiveClass}'>
                                    <i class='far fa-heart'></i>
                                    <span>${postData.likes.length || ""}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}

const outputPosts = (results, container) => {
	container.html("");

	if (!Array.isArray(results)) {
		results = [results];
	}
	results.forEach(result => {
		var html = createPostHtml(result)
		container.append(html);
	});

	if (results.length == 0) {
		container.append("<span class='noResults'>Nothing to show.</span>")
	}
}

const outputUsers = (results, container) => {
	container.html("");

	results.forEach(result => {
		var html = createUserHtml(result, true);
		container.append(html);
	});

	if (results.length == 0) {
		container.append("<span class='noResults'>No results found</span>")
	}
}

const createUserHtml = (userData, showFollowButton) => {
	var name = userData.firstName + " " + userData.lastName;
	var isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id);
	var text = isFollowing ? "Following" : "Follow"
	var buttonClass = isFollowing ? "followButton following" : "followButton"

	var followButton = "";
	if (showFollowButton && userLoggedIn._id != userData._id) {
		followButton = `<div class='followButtonContainer'>
                          <button class='${buttonClass}' data-user='${userData._id}'>${text}</button>
                      </div>`;
	}

	return `<div class='user'>
              <div class='userImageContainer'>
                  <img src='${userData.profilePic}'>
              </div>
              <div class='userDetailsContainer'>
                  <div class='header'>
                      <a href='/profile/${userData.username}'>${name}</a>
                      <span class='username'>@${userData.username}</span>
                  </div>
              </div>
              ${followButton}
          </div>`;
}

const userSelected = (user) => {
	selectedUsers.push(user);
	updateSelectedUsersHtml()
	$("#userSearchTextbox").val("").focus();
	$(".resultsContainer").html("");
	$("#createChatButton").prop("disabled", false);
}

const updateSelectedUsersHtml = () => {
	var elements = [];

	selectedUsers.forEach(user => {
		var name = user.firstName + " " + user.lastName;
		var userElement = $(`<span class='selectedUser'>${name}</span>`);
		elements.push(userElement);
	})

	$(".selectedUser").remove();
	$("#selectedUsers").prepend(elements);
}

const outputSelectableUsers = (results, container) => {
	container.html("");

	results.forEach(result => {
		if (result._id == userLoggedIn._id || selectedUsers.some(u => u._id == result._id)) {
			return;
		}

		const html = createUserHtml(result, false);
		const element = $(html);
		element.click(() => userSelected(result))

		container.append(element);
	});

	if (results.length == 0) {
		container.append("<span class='noResults'>No results found</span>")
	}
}


const addMessage = (message) => {
  const messageDiv = createMessageHtml(message, null, "");
  $(".chatMessages").append(messageDiv);
}

const createMessageHtml = (message, nextMessage, lastSenderId) => {
  const sender = message.sender;
  const senderName = sender.firstName + " " + sender.lastName;

  const currentSenderId = sender._id;
  const nextSenderId = nextMessage != null ? nextMessage.sender._id : "";

  const isFirst = lastSenderId != currentSenderId;
  const isLast = nextSenderId != currentSenderId;

  const isMine = message.sender._id == userLoggedIn._id;
  let liClassName = isMine ? "mine" : "theirs";

  let nameElement = "";
  if (isFirst) {
    liClassName += " first";

    if (!isMine) {
      nameElement = `<span class='senderName'>${senderName}</span>`;
    }
  }

  let profileImage = "";
  if (isLast) {
    liClassName += " last";
    profileImage = `<img src='${sender.profilePic}'>`;
  }

  let imageContainer = "";
  if (!isMine) {
    imageContainer = `<div class='imageContainer'>
                        ${profileImage}
                      </div>`;
  }

  return `<li class='message ${liClassName}'>
              ${imageContainer}
              <div class='messageContainer'>
                  ${nameElement}
                  <span class='messageBody'>
                      ${message.content}
                  </span>
              </div>
          </li>`;
}


const scrollToBottom = (animated) => {
  const container = $(".chatMessages");
  const scrollHeight = container[0].scrollHeight;

  if (animated) {
    container.animate({ scrollTop: scrollHeight }, "slow");
  }
  else {
    container.scrollTop(scrollHeight);
  }
}

const createNotificationHtml = (notification) => {
    const userFrom = notification.userFrom;
    const text = getNotificationText(notification);
    const href = getNotificationUrl(notification);
    const className = notification.opened ? "" : "active";
  
    return `<a href='${href}' class='resultListItem notification ${className}' data-id='${notification._id}'>
                <div class='resultsImageContainer'>
                    <img src='${userFrom.profilePic}'>
                </div>
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='ellipsis'>${text}</span>
                </div>
            </a>`;
  }
  
  const getNotificationText = (notification) => {
    const userFrom = notification.userFrom;
    const userFromName = `${userFrom.firstName} ${userFrom.lastName}`;
    
    let text;
    if (notification.notificationType == "retweet") 
        text = `${userFromName} retweeted one of your posts`;
    else if (notification.notificationType == "postLike")
        text = `${userFromName} liked one of your posts`;
    else if (notification.notificationType == "reply")
        text = `${userFromName} replied to one of your posts`;
    else if (notification.notificationType == "follow") 
        text = `${userFromName} followed you`;
  
    return `<span class='ellipsis'>${text}</span>`;
  }
  
const getNotificationUrl = (notification) => { 
    let url = "#";

    if (notification.notificationType == "retweet" || 
        notification.notificationType == "postLike" || 
        notification.notificationType == "reply") 
        url = `/posts/${notification.entityId}`;

    else if (notification.notificationType == "follow") 
        url = `/profile/${notification.entityId}`;
    return url;
}



const getChatName = (chatData) => {
    let chatName = chatData.chatName;
    if (!chatName) {
        const otherChatUsers = getOtherChatUsers(chatData.users);
        const namesArray = otherChatUsers.map(user => user.firstName + " " + user.lastName);
        chatName = namesArray.join(", ");
    }
    return chatName;
}

function getOtherChatUsers(users) {
    if(users.length == 1) return users;

    return users.filter(user => user._id != userLoggedIn._id);
}

// function messageReceived(newMessage) {
//     if($(`[data-room="${newMessage.chat._id}"]`).length == 0) {
//         // Show popup notification
//         showMessagePopup(newMessage);
//     }
//     else {
//         addChatMessageHtml(newMessage);
//     }

//     refreshMessagesBadge()
// }
function showMessagePopup(data) {

    if(!data.chat.latestMessage._id) {
        data.chat.latestMessage = data;
    }

    var html = createChatHtml(data.chat);
    var element = $(html);
    element.hide().prependTo("#notificationList").slideDown("fast");

    setTimeout(() => element.fadeOut(400), 5000);
}



function createChatHtml(chatData) {
    var chatName = getChatName(chatData);
    var image = getChatImageElements(chatData);
    var latestMessage = getLatestMessage(chatData.latestMessage);

    var activeClass = !chatData.latestMessage || chatData.latestMessage.readBy.includes(userLoggedIn._id) ? "" : "active";
    
    return `<a href='/messages/${chatData._id}' class='resultListItem ${activeClass}'>
                ${image}
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='heading ellipsis'>${chatName}</span>
                    <span class='subText ellipsis'>${latestMessage}</span>
                </div>
            </a>`;
}

function getLatestMessage(latestMessage) {
    if (latestMessage != null) {
        var sender = latestMessage.sender;
        return `${sender.firstName} ${sender.lastName}: ${latestMessage.content}`;
    }

    return "New chat";
}

function getChatImageElements(chatData) {
    var otherChatUsers = getOtherChatUsers(chatData.users);

    var groupChatClass = "";
    var chatImage = getUserChatImageElement(otherChatUsers[0]);

    if(otherChatUsers.length > 1) {
        groupChatClass = "groupChatImage";
        chatImage += getUserChatImageElement(otherChatUsers[1]);
    }

    return `<div class='resultsImageContainer ${groupChatClass}'>${chatImage}</div>`;
}

function getUserChatImageElement(user) {
    if (!user || !user.profilePic) {
        return alert("User passed into function is invalid");
    }
    return `<img src='${user.profilePic}' alt='User's profile pic'>`;
}
