module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: '@strapi/provider-upload-aws-s3',
      providerOptions: {
        s3Options: {
          credentials: {
            accessKeyId: env('AWS_ACCESS_KEY_ID'),
            secretAccessKey: env('AWS_SECRET_ACCESS_KEY'),
          },
          region: env('AWS_REGION'),
          params: {
            Bucket: env('AWS_S3_UPLOAD_BUCKET'),
            ACL: false,
          },
        },
        baseUrl: env('AWS_S3_UPLOAD_CDN_URL'),
        rootPath: 'lish-uploads',
      },
    },
  },
});
