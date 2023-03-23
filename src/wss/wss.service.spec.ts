import { Test, TestingModule } from '@nestjs/testing';
import { WssService } from './wss.service';

describe('WssService', () => {
  let service: WssService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WssService],
    }).compile();

    service = module.get<WssService>(WssService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
