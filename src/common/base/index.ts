/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-20 17:56:13
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-29 21:52:06
 * @FilePath: /sbng_cake/shareholder_services/src/common/base/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import { HttpStatus } from '@nestjs/common';
import { ErrorResult, SuccessResult } from './response';

export interface SuccessResponse<T> {
  data: T;
  message: string;
  errno: number;
}

export interface ErrorResponse {
  data: null;
  message: string;
  errno: number;
}

export type BaseResponse<T> = SuccessResponse<T> | ErrorResponse;

export class BaseController {
  protected success<T>(
    data: T,
    message?: string,
    code?: HttpStatus,
  ): BaseResponse<T> {
    return new SuccessResult(data, message, code || 0);
  }

  protected error(message: string | Error, code?: HttpStatus): ErrorResponse {
    const errMsg = message instanceof Error ? message.message : message;
    return new ErrorResult(errMsg, code || 1);
  }
}
