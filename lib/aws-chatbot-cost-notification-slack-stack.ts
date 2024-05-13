import * as cdk from "aws-cdk-lib";
import { aws_budgets, aws_chatbot, aws_iam, aws_sns } from "aws-cdk-lib";
import { Construct } from "constructs";

export class AwsChatbotCostNotificationSlackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const slackChannelId = scope.node.tryGetContext("slackChannelId") as string;
    const slackWorkspaceId = scope.node.tryGetContext(
      "slackWorkspaceId"
    ) as string;

    const idPrefix = `aws-chatbot-cost-notification-slack-${slackChannelId}`;

    const topic = this.createSnsTopic(idPrefix);

    this.createChatbot(idPrefix, topic, slackWorkspaceId, slackChannelId);

    this.createBudget(idPrefix, topic);
  }

  private createBudget(idPrefix: string, topic: cdk.aws_sns.Topic) {
    new aws_budgets.CfnBudget(this, `${idPrefix}-budget`, {
      budget: {
        budgetLimit: {
          amount: 100,
          unit: "USD",
        },
        budgetName: `${idPrefix}-budget`,
        budgetType: "COST",
        timeUnit: "MONTHLY",
      },
      notificationsWithSubscribers: [
        {
          notification: {
            notificationType: "ACTUAL",
            comparisonOperator: "GREATER_THAN",
            threshold: 50,
            thresholdType: "PERCENTAGE",
          },
          subscribers: [
            {
              subscriptionType: "SNS",
              address: topic.topicArn,
            },
          ],
        },
      ],
    });
  }

  private createChatbot(
    idPrefix: string,
    topic: cdk.aws_sns.Topic,
    slackWorkspaceId: string,
    slackChannelId: string
  ) {
    const chatbotRole = new aws_iam.Role(this, `${idPrefix}-role`, {
      assumedBy: new aws_iam.ServicePrincipal("chatbot.amazonaws.com"),
    });

    chatbotRole.addToPolicy(
      new aws_iam.PolicyStatement({
        actions: ["sns:Subscribe"],
        resources: [topic.topicArn],
      })
    );

    new aws_chatbot.SlackChannelConfiguration(this, `${idPrefix}-chatbot`, {
      slackChannelConfigurationName: `${idPrefix}-chatbot`,
      slackWorkspaceId,
      slackChannelId,
      notificationTopics: [topic],
      role: chatbotRole,
    });
  }

  private createSnsTopic(idPrefix: string) {
    const topic = new aws_sns.Topic(this, `${idPrefix}-topic`, {
      displayName: `${idPrefix}-topic`,
      topicName: `${idPrefix}-topic`,
    });

    topic.addToResourcePolicy(
      new aws_iam.PolicyStatement({
        effect: aws_iam.Effect.ALLOW,
        actions: ["sns:Publish"],
        principals: [new aws_iam.ServicePrincipal("budgets.amazonaws.com")],
        resources: [topic.topicArn],
      })
    );
    return topic;
  }
}
