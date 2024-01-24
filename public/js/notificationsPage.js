$(document).ready(async () => {
  try {
    url = '/api/notifications';
    method = 'GET';

    let response = await axios({ url, method });

    outputNotificationList(response.data.data.notifications, $(".resultsContainer"));
  } catch (err) {
    if (err.response) alert(err.response.data.message);
    else alert('Something went wrong');
  }
});

const outputNotificationList = (notifications, container) => {
  notifications.forEach(notification => {
    const html = createNotificationHtml(notification);
    container.append(html);
  })

  if (notifications.length == 0) {
    container.append("<span class='noResults'>Nothing to show.</span>");
  }
}