const textarea = document.getElementById('postTextarea');
const submitButton = document.getElementById('submitPostButton');
const postsContainer = document.querySelector('.postsContainer');

let timer;
const emitNotification = (room) => {
  socket.emit('notification recieved', room);
}

//adding post
const addPost = async (data) => {
  const url = '/api/posts';
  const method = 'POST';

  try {
    const response = await axios({
      method,
      url,
      data
    });
    const post = response.data.data.post;
    if (post.replyTo) {
      const userTo = post.replyTo.postedBy._id;
      emitNotification(userTo);
    }
    window.location.reload();
  } catch (err) {
    if (err.response) return alert(err.response.data.message);
    alert('something went wrong');
  }
}
//enable or disable the post button
$("#postTextarea, #replyTextarea").keyup(event => {
  const textbox = $(event.target);
  const value = textbox.val().trim();

  const isModal = textbox.parents(".modal").length == 1;
  const submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton");

  if (submitButton.length == 0) return alert("No submit button found");

  if (value == "") {
    submitButton.prop("disabled", true);
    return;
  }
  submitButton.prop("disabled", false);
})

//like Button
$(document).on('click', '.likeButton', async (event) => {
  const button = $(event.target);
  button.prop('disabled', true);
  const post = button.closest('.post');
  const postId = post.data().id;

  try {
    const url = `/api/posts/${postId}/like`;
    const method = 'PUT';
    const response = await axios({
      url,
      method
    });

    const post = response.data.data.post;
    const like = response.data.data.like;
    if (like) {
      button.addClass('active');
      const userTo = post.postedBy._id;
      if (userLoggedIn._id.toString() != userTo.toString()) {
        emitNotification(userTo);
      }
    } else button.removeClass('active');

    const likes = post.likes.length;
    button.find('span').text(" " + (likes || ""));
    button.prop('disabled', false);
  } catch (err) {
    button.prop('disabled', false);
    if (err.response) return alert(err.response.data.message);
    return alert('something went wrong');
  }
})


//tweet Button
$(document).on('click', '.retweetButton', async (event) => {
  const button = $(event.target);
  button.prop('disabled', true);
  const post = button.closest('.post');
  const postId = post.data().id;

  try {
    const url = `/api/posts/${postId}/retweet`;
    const method = 'POST';
    const response = await axios({
      url,
      method
    });

    const post = response.data.data.post;
    const retweet = response.data.data.retweet;

    if (retweet) {
      button.addClass('active');
      const userTo = post.postedBy._id;
      if (userLoggedIn._id.toString() != userTo.toString()) {
        emitNotification(userTo);
      }
    } else button.removeClass('active');
    button.prop('disabled', false);
    window.location.reload();
  } catch (err) {
    button.prop('disabled', false);
    if (err.response) return alert(err.response.data.message);
    return alert('something went wrong');
  }
})

$("#replyModal").on("show.bs.modal", async (event) => {
  const button = $(event.relatedTarget);
  const postId = button.closest('.post').data().id;

  try {
    const url = `/api/posts/${postId}`;
    const method = 'GET';
    const response = await axios({
      url,
      method
    });

    const post = response.data.data.post;
    $("#submitReplyButton").data("id", postId);
    createPostHtml(post);
    outputPosts(post, $("#originalPostContainer"));
  } catch (err) {
    if (err.response) return alert(err.response.data.message);
    return alert('something went wrong');
  }
})

$("#deletePostModal").on("show.bs.modal", (event) => {
  const button = $(event.relatedTarget);
  const post = button.closest('.post');
  const postId = post.data().id;
  $('#deletePostButton').data('id', postId);
})

$("#deletePostButton").click(async event => {
  const button = $(event.target)
  const postId = button.data('id');
  button.prop('disabled', true);
  try {
    const url = `/api/posts/${postId}`;
    const method = 'DELETE';
    const response = await axios({
      url,
      method
    });
    button.prop('disabled', false);
    window.location.reload();
  } catch (err) {
    button.prop('disabled', false);
    if (err.response) return alert(err.response.data.message);
    return alert('something went wrong');
  }
})

$("#submitPostButton, #submitReplyButton").click(async (event) => {
  const button = $(event.target);
  const isModal = button.parents(".modal").length == 1;
  const textbox = isModal ? $("#replyTextarea") : $("#postTextarea");
  const data = {
    content: textbox.val()
  }

  if (isModal) {
    const id = button.data().id;
    if (id == null) return alert("Button id is null");
    data.replyTo = id;
  }

  button.prop('disabled', true);
  try {
    await addPost(data);
    button.prop('disabled', false);
  } catch (err) {
    button.prop('disabled', false);
    if (err.reponse) return alert(err.response.data.message);
    else alert('Something went wrong');
  }
})

$(document).on('click', '.post', (event) => {
  const target = $(event.target);
  const post = target.closest('.post');
  if (!post) return alert('this post is no longer be exist');
  const postId = post.data().id;
  if (!target.is('button')) {
    window.location = '/posts/' + postId;
  }
})


//post follow
$(document).on('click', '.followButton', async (event) => {
  const button = $(event.target);
  button.prop('disabled', true);
  const userId = button.data().user;

  try {
    const url = `/api/users/${userId}/follow`;
    const method = 'PUT';

    const response = await axios({
      url,
      method
    });
    const follow = response.data.data.follow;
    const user = response.data.data.user;

    if (follow) {
      button.text('Follwing');
      button.addClass('following');
      emitNotification(userId);
    } else {
      button.text('Follow');
      button.removeClass('following');
    }

    const followersLabel = $("#followersValue");
    followersLabel.text(user.followers.length);
    button.prop('disabled', false);
  } catch (err) {
    button.prop('disabled', false);
    if (err.reponse) return alert(err.response.data.message);
    else alert('Something went wrong');
  }
})

$("#filePhoto, #coverPhoto").change(function () {
  if (!this.files || !this.files[0]) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const id = (this.id == 'filePhoto') ? "imagePreview" : "coverPreview";
    const image = document.getElementById(id);
    image.src = e.target.result;
  }
  reader.readAsDataURL(this.files[0]);
})

$("#imageUploadButton, #coverPhotoButton").click(async event => {

  const id = event.target.id;
  const field = $(id == 'imageUploadButton' ? "#filePhoto" : '#coverPhoto');
  const files = field.prop('files');

  if (files.length == 0)
    return alert('you must choose a file');

  try {
    const form = new FormData();
    form.append(id == 'imageUploadButton' ? 'profilePic' : 'coverPhoto', files[0]);
    const url = `/api/users/${id == 'imageUploadButton' ? 'profilePicture' : 'coverPhoto'}`;
    const method = 'POST';

    const response = await axios({
      url,
      method,
      data: form,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    window.location.reload();
  } catch (err) {
    if (err.response) alert(err.response.data.message);
    else alert('Some thing went wrong')
  }
})

$("#confirmPinModal, #unpinModal").on("show.bs.modal", (event) => {
  const Pin = (event.target.id == 'confirmPinModal');

  const target = $(event.relatedTarget);
  const post = target.closest('.post');
  const postId = post.data().id;
  $(Pin ? "#pinPostButton" : "#unpinPostButton").data('id', postId);
})

$("#pinPostButton, #unpinPostButton").click(async event => {
  const button = $(event.target);
  const postId = button.data().id;
  const Pin = (event.target.id == "pinPostButton") ? "pin" : "unpin";

  try {
    const url = `/api/posts/${postId}/${Pin}`;
    const method = 'PATCH';
    await axios({
      url,
      method
    });

    window.location.reload();
  } catch (err) {
    alert('Something went wrong');
  }
});

$("#markNotificationsAsRead").click(async event => {
  markAsOpened();
});

const popUpChat = (chat) => {
  const html = createChatHtml(chat);
  const element = $(html);

  element.hide().prependTo($('#notificationList')).slideDown(500);
  refreshMessageBadge();

  setTimeout(() => {
    element.fadeOut(500);
  }, 4000);
}

const messageReceived = (message) => {
  if ($(".chatContainer").length == 0) {
    // Show popup notification
    popUpChat(message.chat);
  } else addMessage(message);
}

const markAsOpened = async (notificationId, callback) => {
  if (!callback) {
    callback = () => window.location.reload();
  }
  
  const url = (notificationId) ? `/api/notifications/${notificationId}/markAsOpened` :
    `/api/notifications/markAsOpened`;
  const method = 'PATCH';

  try {
    await axios({
      url,
      method
    });
    callback();
  } catch (err) {
    if (err.response) alert(err.response.data.message);
    else alert('Something went Wrong');
  }
}

$(document).on('click', '.notification', async event => {
  event.preventDefault();

  const notification = $(event.target);
  const id = notification.data().id;
  const href = notification.attr('href');

  const callback = () => window.location.href = href;

  await markAsOpened(id, callback);
})

const refreshMessageBadge = async () => {
  try {
    const url = '/api/chats';
    const method = 'GET';
    const params = {
      unreadOnly: true
    };

    const response = await axios({
      url,
      method,
      params
    });
    const length = response.data.data.chats.length;
    const Badge = $("#messagesBadge");

    if (length == 0)
      Badge.text("").removeClass('active');
    else
      Badge.text(length).addClass('active');
  } catch (err) {
    if (err.response) alert(err.response.data.message);
    else alert('Something went wrong');
  }
}

const refreshNotificationBadge = async () => {
  try {
    const url = '/api/notifications/count';
    const method = 'GET';
    const params = {
      unreadOnly: true
    };

    const response = await axios({
      url,
      method,
      params
    });
    const length = response.data.data.count;
    const Badge = $("#notificationBadge");

    if (length == 0)
      Badge.text("").removeClass('active');
    else
      Badge.text(length).addClass('active');
  } catch (err) {
    if (err.response) alert(err.response.data.message);
    else alert('Something went wrong');
  }
}

const popUpNotification = async () => {
  try {
    const url = '/api/notifications/latest';
    const method = 'GET';

    const response = await axios({
      url,
      method
    });
    const notification = response.data.data.notification;

    const html = createNotificationHtml(notification);
    const element = $(html);

    element.hide().prependTo($('#notificationList')).slideDown(500);
    refreshNotificationBadge();

    setTimeout(() => {
      element.fadeOut(500);
    }, 4000);

  } catch (err) {
    if (err.response) alert(err.response.data.message);
    else alert('Something went Wrong');
  }
}

const readAll = async () => {
  let url = '/api/notifications/markAsOpened';
  let method = 'PATCH';
  await axios({ url, method });
}

$(document).ready(async () => {
  refreshMessageBadge();
  if (window.location.pathname == '/notifications') await readAll();
  refreshNotificationBadge();
})