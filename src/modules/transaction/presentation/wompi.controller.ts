import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WompiAdapter } from '../infrastructure/wompi.adapter';
import { TokenizeCardDto } from './dto/tokenize-card.dto';

@ApiTags('Wompi')
@Controller('wompi')
export class WompiController {
  constructor(private readonly wompiAdapter: WompiAdapter) {}

  @Get('acceptance-token')
  @ApiOperation({
    summary: 'Get acceptance token for card tokenization',
    description:
      'Returns the acceptance token required by Wompi for card tokenization. This must be obtained before tokenizing card data.',
  })
  @ApiResponse({
    status: 200,
    description: 'Acceptance token retrieved successfully',
  })
  @ApiResponse({ status: 500, description: 'Failed to get acceptance token' })
  async getAcceptanceToken() {
    try {
      const result = await this.wompiAdapter.getAcceptanceToken();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : 'Failed to get acceptance token',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('tokenize-card')
  @ApiOperation({
    summary: 'Tokenize a credit card',
    description:
      'Tokenizes credit card data and returns a token that can be used for payments. IMPORTANT: In production, this should be called directly from the frontend using Wompi.js SDK for PCI compliance.',
  })
  @ApiResponse({ status: 200, description: 'Card tokenized successfully' })
  @ApiResponse({ status: 400, description: 'Invalid card data' })
  async tokenizeCard(@Body() tokenizeCardDto: TokenizeCardDto) {
    const result = await this.wompiAdapter.tokenizeCard({
      cardNumber: tokenizeCardDto.cardNumber,
      cvc: tokenizeCardDto.cvc,
      expMonth: tokenizeCardDto.expMonth,
      expYear: tokenizeCardDto.expYear,
      cardHolder: tokenizeCardDto.cardHolder,
    });

    if (!result.success) {
      throw new HttpException(
        {
          success: false,
          message: result.errorMessage,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      success: true,
      data: {
        tokenId: result.tokenId,
        brand: result.brand,
        lastFour: result.lastFour,
        expiresAt: result.expiresAt,
      },
    };
  }
}
