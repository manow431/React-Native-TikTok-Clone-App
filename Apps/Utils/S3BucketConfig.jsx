import {S3} from "aws-sdk"
export const s3bucket=new S3({
    accessKeyId:<Your access id>,
    secretAccessKey:<Your Access Key>,
    region:process.env.EXPO_PUBLIC_AWS_REGION
})