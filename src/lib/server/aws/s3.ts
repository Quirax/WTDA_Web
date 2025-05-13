// ref: https://velog.io/@kyu0/AWS-S3-%EB%8F%84%EC%9E%85-feat.-Javascript-v3-%EB%A7%88%EC%9D%B4%EA%B7%B8%EB%A0%88%EC%9D%B4%EC%85%98
import {
	$Command,
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
	type S3ClientResolvedConfig,
	type ServiceInputTypes,
	type ServiceOutputTypes,
} from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';

if (!env.S3_ACCESS_KEY) throw new Error('S3_ACCESS_KEY is not set');
if (!env.S3_ACCESS_SECRET) throw new Error('S3_ACCESS_SECRET is not set');
if (!env.S3_BUCKET) throw new Error('S3_BUCKET is not set');

const bucket = env.S3_BUCKET;

const S3 = new S3Client({
	region: 'ap-northeast-2', // 버킷의 aws 리전
	credentials: {
		accessKeyId: env.S3_ACCESS_KEY, // 사용자 생성 시 발급받은 액세스 키
		secretAccessKey: env.S3_ACCESS_SECRET, // 사용자 생성 시 발급받은 비밀 액세스 키
	},
});

type Command<Input extends ServiceInputTypes, Output extends ServiceOutputTypes> = $Command<
	Input,
	Output,
	S3ClientResolvedConfig
>;

const commander = <Input extends ServiceInputTypes, Output extends ServiceOutputTypes, Body>(
	command: Command<Input, Output>,
	bodyGen: (response: Output) => Body,
) =>
	S3.send(command)
		.then((response) => {
			if (response.$metadata.httpStatusCode == 200) {
				return { success: true, ...bodyGen(response) };
			} else {
				throw { success: false, reason: response.$metadata.httpStatusCode };
			}
		})
		.catch((error) => {
			console.error(error);
			throw { success: false, reason: error };
		}) as Promise<
		{
			success: boolean;
		} & Body
	>;

export const put = (destPath: string, file: string | Uint8Array | Buffer | ReadableStream) =>
	commander(
		new PutObjectCommand({
			Bucket: bucket,
			Key: destPath,
			Body: file,
		}),
		() => ({ path: destPath }),
	);

export const get = (destPath: string) =>
	commander(
		new GetObjectCommand({
			Bucket: bucket,
			Key: destPath,
		}),
		(response) => ({ data: response.Body }),
	);

export const remove = (destPath: string) =>
	commander(
		new DeleteObjectCommand({
			Bucket: bucket,
			Key: destPath,
		}),
		() => ({ path: destPath }),
	);
