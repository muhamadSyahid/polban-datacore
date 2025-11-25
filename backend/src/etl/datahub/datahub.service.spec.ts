import { Test, TestingModule } from '@nestjs/testing';
import { DataHubService } from './datahub.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { DataHubMahasiswaDto } from './dto/datahub-mahasiswa.dto';

describe('DataHubService', () => {
  let service: DataHubService;
  let httpService: HttpService;

  const MOCK_BASE_URL = 'http://mock-api';

  const mockRawApiResponse = {
    data: [
      {
        mahasiswa_id: 101,
        angkatan: 2024,
        jenis_kelamin: 'L',
        agama: 'Islam',
        tgl_lahir: '2005-01-01',
        updated_at: '2025-01-01T00:00:00Z',
        wilayah: {
          wilayah_id: 1,
          nama_wilayah: 'Bandung',
          latitude: -6.9,
          longitude: 107.6,
        },
        slta: { nama_slta: 'SMAN 1' },
        jalur_daftar: { nama_jalur_daftar: 'SNBP' },
        extra_field_that_should_be_removed: 'secret',
      },
    ],
  };

  const mockAxiosResponse: AxiosResponse = {
    data: mockRawApiResponse,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataHubService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'DATAHUB_URL') return MOCK_BASE_URL;
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<DataHubService>(DataHubService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMahasiswaData', () => {
    it('should fetch data, transform to DTO, and exclude extraneous values', async () => {
      // Arrange
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      // Act
      const result = await service.getMahasiswaData();

      // Assert
      // Check if HTTP call was made correctly
      expect(httpService.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/data/mahasiswa'),
        { params: {} },
      );

      // Check Transformation
      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toBeInstanceOf(DataHubMahasiswaDto);
      expect(result[0].mahasiswaId).toBe(101);
      expect(result[0].jenisKelamin).toBe('L');
      expect(result[0].wilayah?.namaWilayah).toBe('Bandung');

      // Check Exclusion
      expect(
        (result[0] as any).extra_field_that_should_be_removed,
      ).toBeUndefined();
    });

    it('should pass updated_since parameter correctly', async () => {
      // Arrange
      const date = new Date('2025-01-01');
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

      // Act
      await service.getMahasiswaData(date);

      // Assert
      expect(httpService.get).toHaveBeenCalledWith(expect.any(String), {
        params: { updated_since: date.toISOString() },
      });
    });

    it('should throw error and log it when API call fails', async () => {
      // Arrange
      const error = new Error('API Gateway Timeout');
      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => error));

      // Act & Assert
      await expect(service.getMahasiswaData()).rejects.toThrow(
        'API Gateway Timeout',
      );
    });

    it('should return empty array if data is null/undefined', async () => {
      // Arrange
      const emptyResponse = { ...mockAxiosResponse, data: { data: null } };
      jest.spyOn(httpService, 'get').mockReturnValue(of(emptyResponse));

      // Act
      const result = await service.getMahasiswaData();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('Future Proofing Stubs', () => {
    it('getAkademikData should return empty array', async () => {
      expect(await service.getAkademikData()).toEqual([]);
    });

    it('getDosenData should return empty array', async () => {
      expect(await service.getDosenData()).toEqual([]);
    });
  });
});
