import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from './http.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('HttpService', () => {
  let service: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [HttpService, ConfigService],
    }).compile();

    service = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
