import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { HitCounter } from "./hitcounter";
import { TableViewer } from "cdk-dynamo-table-viewer";

export class CdkWorkshopStack extends Stack {
    // ADD THIS
    public readonly hcViewerUrl: CfnOutput;
    public readonly hcEndpoint: CfnOutput;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // defines an AWS Lambda resource
    const hello = new Function(this, "HelloHandler", {
      runtime: Runtime.NODEJS_18_X, // execution environment
      code: Code.fromAsset("lambda"), // code loaded from "lambda" directory
      handler: "hello.handler", // file is "hello", function is "handler"
    });

    const helloWithCounter = new HitCounter(this, "HelloHitCounter", {
      downstream: hello,
    });

    // defines an API Gateway REST API resource backed by our "hello" function.
    const gateway = new LambdaRestApi(this, "Endpoint", {
      handler: helloWithCounter.handler,
    });

    const tv = new TableViewer(this, "ViewHitCounter", {
      title: "Hello Hits",
      table: helloWithCounter.table,
    });
    
    // ADD THIS
    this.hcEndpoint = new CfnOutput(this, "GatewayUrl", {
      value: gateway.url,
    });

    this.hcViewerUrl = new CfnOutput(this, "TableViewerUrl", {
      value: tv.endpoint,
    });
  }
}
// import * as cdk from 'aws-cdk-lib';
// import { Construct } from 'constructs';
// import * as lambda from 'aws-cdk-lib/aws-lambda';
// import * as apigw from 'aws-cdk-lib/aws-apigateway';
// import { TableViewer } from "cdk-dynamo-table-viewer";
// import { HitCounter } from "./hitcounter";
// // import * as sqs from 'aws-cdk-lib/aws-sqs';

// export class CdkWorkshopStack extends cdk.Stack {
//   constructor(scope: Construct, id: string, props?: cdk.StackProps) {
//     super(scope, id, props);
//     // 第二層，呼叫第一層。會被初始層cdk-workshop.ts呼叫
//     /* would be called by our initial layer(cdk-workshop.ts), 
//     hand down req. to third layer, and reverse back as resp. .*/
//     const hello = new lambda.Function(this, 'HelloHandler', {
//       runtime: lambda.Runtime.NODEJS_18_X,
//       code: lambda.Code.fromAsset('lambda'),
//       handler: 'hello.handler',
//     })
//     const helloWithCounter = new HitCounter(this, "HelloHitCounter", {
//       downstream: hello,
//     });

//     // defines an API Gateway REST API resource backed by our "hello" function.
//     const gateway = new apigw.LambdaRestApi(this, "Endpoint", {
//       handler: helloWithCounter.handler,
//     });

//     // 新增tableViewer
//     const tv = new TableViewer(this, 'ViewHitCounter', {
//       title: 'Hello Hits',
//       table: helloWithCounter.table,
//     });
//     // The code that defines your stack goes here
 
//     // example resource
//     // const queue = new sqs.Queue(this, 'CdkWorkshopQueue', {
//     //   visibilityTimeout: cdk.Duration.seconds(300)
//     // });
//   }
// }
