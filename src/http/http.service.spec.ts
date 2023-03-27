import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from './http.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

jest.mock('@nestjs/config');

describe('HttpService', () => {
  let service: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpService, ConfigService],
    }).compile();

    service = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrentBlockNumber', () => {
    it('should return the current block number', async () => {
      const blockNumber = 12345;
      service.provider.getBlockNumber = jest
        .fn()
        .mockResolvedValue(blockNumber);

      const result = await service.getCurrentBlockNumber();
      expect(result).toEqual(blockNumber);
    });

    it('should throw an error if the provider fails', async () => {
      const error = new Error('Failed to fetch block number');
      service.provider.getBlockNumber = jest.fn().mockRejectedValue(error);

      await expect(service.getCurrentBlockNumber()).rejects.toThrow(error);
    });
  });
});
