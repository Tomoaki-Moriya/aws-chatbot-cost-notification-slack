# aws-chatbot-cost-notification-slack

This project is a AWS CDK application that sets up a system to send AWS cost notifications to a Slack channel via AWS Chatbot.

## Structure

The main logic of the application is implemented in the `AwsChatbotCostNotificationSlackStack` class in the `lib/aws-chatbot-cost-notification-slack-stack.ts`file. This class extends the `cdk.Stack` class and includes methods to create an AWS Budget, a Chatbot, and an SNS Topic.

## Deploy

### Please create a Slack channel where you want to receive the notifications and install the AWS Chatbot App.

```sh
cdk deploy AwsChatbotCostNotificationSlackStack -c slackWorkspaceId=[your-slack-workspaceId] -c slackChannelId=[your-slack-channelId] --profile [your-profile-bame]
```
