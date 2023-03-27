import { EntityManager } from '@mikro-orm/postgresql';
import { Test, TestingModule } from '@nestjs/testing';
import { DbService } from './db.service';

describe('DbService', () => {
  let service: DbService;

  beforeEach(async () => {
    const entityManagerMock = {
      fork: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DbService,
        { provide: EntityManager, useValue: entityManagerMock },
      ],
    }).compile();

    service = module.get<DbService>(DbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
