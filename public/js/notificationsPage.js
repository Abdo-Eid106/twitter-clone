$(document).ready(async () => {
  try {
    const url = '/api/notifications';
    const method = 'GET';

    const response = await axios({
      url,
      method
    });
    outputNotificationList(response.data.data.notifications, $(".resultsContainer"));
  } catch (err) {
    if (err.response) alert(err.response.data.message);
    else alert('Something went wrong');
  }
});

$(document).on('click', '.notification.active', async event => {
  event.preventDefault();
  const id = $(event.target).data().id;
  const href = $(event.target).attr('href');
  const callback = () => window.location.href = href;
  markAsOpened(id, callback);
})

const outputNotificationList = (notifications, container) => {
  notifications.forEach(notification => {
    const html = createNotificationHtml(notification);
    container.append(html);
  })

  if (notifications.length == 0) {
    container.append("<span class='noResults'>Nothing to show.</span>");
  }
}