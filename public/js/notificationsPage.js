$(document).ready(async () => {
  try {
    url = '/api/notifications';
    method = 'GET';

    let response = await axios({ url, method });

    for (let noti of response.data.data.notifications) {
      console.log(noti);
    }

    outputNotificationList(response.data.data.notifications, $(".resultsContainer"));
  } catch (err) {
    if (err.response) alert(err.response.data.message);
    else alert('Something went wrong');
  }
});

$(document).on('click', '.notification.active', async event => {
  event.preventDefault();

  const notification = $(event.target);
  const id = notification.data().id;
  const href = notification.attr('href');

  const callback = () => window.location.href = href;

  await markAsOpened(id, callback);
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