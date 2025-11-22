import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateScheduleDto } from './dto/schedule-job.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post('run')
  async runJob(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.addJobToQueue(createJobDto);
  }

  @Put('schedules')
  async updateSchedule(@Body() dto: UpdateScheduleDto) {
    return this.jobsService.updateSchedule(dto);
  }

  @Get('schedules')
  async getSchedules() {
    return this.jobsService.getSchedules();
  }
}
