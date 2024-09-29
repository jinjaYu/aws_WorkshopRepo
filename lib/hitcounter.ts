import { AttributeType, Table, TableEncryption } from "aws-cdk-lib/aws-dynamodb";
import { Code, Function, IFunction, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export interface HitCounterProps {
  /** the function for which we want to count url hits **/
  downstream: IFunction;
  readCapacity?: number;
}

export class HitCounter extends Construct {
  /** allows accessing the counter function */
  public readonly handler: Function;

  /**  allows accessing the hit counter table */
  public readonly table: Table;

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    if (props.readCapacity !== undefined && (props.readCapacity < 5 || props.readCapacity > 20)) {
      throw new Error("readCapacity must be greater than 5 and less than 20");
    }

    super(scope, id);

    this.table = new Table(this, "Hits", {
      partitionKey: {
        name: "path",
        type: AttributeType.STRING,
      },
      encryption: TableEncryption.AWS_MANAGED,
      // 若readCapacity為空則給5
      readCapacity: props.readCapacity ?? 5,
    });

    // ...

  }
}
// import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
// import { Code, Function, IFunction, Runtime } from "aws-cdk-lib/aws-lambda";
// import { Construct } from "constructs";

// export interface HitCounterProps {
//   /** the function for which we want to count url hits **/
//   downstream: IFunction;
// }


// export class HitCounter extends Construct {
//   // 第一層使用功能接口，use handler to manage our function
//   /** allows accessing the counter function */
//   public readonly handler: Function;

//   /** allows accessing the hit counter table */
//   public readonly table: Table;

//   constructor(scope: Construct, id: string, props: HitCounterProps) {
//     super(scope, id);

//     // 展示table，使其能被外接觸
//     this.table = new Table(this, "Hits", {
//       partitionKey: { name: "path", type: AttributeType.STRING },
//     });

//     this.handler = new Function(this, "HitCounterHandler", {
//       runtime: Runtime.NODEJS_18_X,
//       handler: "hitcounter.handler",
//       code: Code.fromAsset("lambda"),
//       // packing env. info of lambda and dynamoTable
//       environment: {
//         DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
//         HITS_TABLE_NAME: this.table.tableName,
//       },
//     });

//     // grant the lambda role read/write permissions to our table
//     this.table.grantReadWriteData(this.handler);

//     // grant the lambda role invoke permissions to the downstream function
//     props.downstream.grantInvoke(this.handler);
//   }
// }