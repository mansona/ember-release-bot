const moment = require('moment');
const _ = require('lodash');
function createMessage({dateString, waitingFor}) {
  if (!dateString) {
    return;
  }

  const date = moment(dateString).add(5, 'days');
  const dayDiff = moment().diff(date, 'days');
  
  if (dayDiff === -11) {
    return `Release week starts next week on ${moment(dateString).format('YYYY-MM-DD')} are we all prepared? :lts:`;
  }

  if (dayDiff === -4) {
    return [
      `:tada: It's release week!! :tada: To see who is done and who isn't you can say '!release done' and I'll tell you who still needs to do something!`,
      '',
      `If you know a team is done you can say '!release done <team>' where team can be blog, framework, data, or cli.`,
    ].join('\n');
  }

  if (dayDiff === -2) {
    if (waitingFor.length) {
      // eslint-disable-next-line quotes
      return `We're half way through release week! Remember: you can say '!release done' to see who still needs to release!`;
    } else {
      return 'Wow! :tada: we have released everything within 3 days!? This must be some sort of record :scream: Congratulations to everyone who helped out! :tada:';
    }
  }

  if (dayDiff === 0) {
    if (waitingFor.length) {
      return `Today is the last day of release week! We're still waiting on ${waitingFor.join(', ')}. Can we release today?`;
    } else {
      return ':tada: We have released everything on time this week :tada: This is worth a bit of a celebration! :tada: Great work team :muscle:';
    }
  }

  if (dayDiff > 0) {
    if (waitingFor.length) {
      return `We are currently :rotating_light: ${dayDiff + 1} Days Late :rotating_light: with the release!! We are still waiting on ${waitingFor.join(', ')}`;
    }
  }
}
module.exports = {
  cron: '00 10 * * *', // once a day at 9:30 UTC
  job(client, keyv) {
    return async () => {
      const channels = client.channels.filter((ch) => ch.name === 'core-meta');

      const dateString = await keyv.get('date');

      const teams = ['blog', 'cli', 'framework', 'data'];

      // eslint-disable-next-line consistent-return
      let waitingFor = await Promise.all(teams.map(async (team) => {
        const value = await keyv.get(`${team}:done`);
        if (!value) {
          return team;
        }
      }));

      waitingFor = _.compact(waitingFor);
      
      const message = createMessage({ dateString, waitingFor });

      if (!message) {
        return;
      }

      channels.forEach((channel) => {
        // more than 5 days means that it's not release week
        channel.send(message);
      });
    };
  },
};
