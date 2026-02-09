export default {
  'users-permissions': {
    enabled: true,
    config: {
      providers: {
        github: {
          enabled: true,
          icon: 'github',
          key: process.env.GITHUB_CLIENT_ID,
          secret: process.env.GITHUB_CLIENT_SECRET,
          callback: `${process.env.SERVER_URL}/api/connect/github/callback`,
          scope: ['user:email'],
        },
      },
    },
  },
};