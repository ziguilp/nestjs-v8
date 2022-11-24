import { SetMetadata } from '@nestjs/common';

export const CustomMetaName_Rights = 'rights';
export const Rights = (name: string) => SetMetadata(CustomMetaName_Rights, name);
