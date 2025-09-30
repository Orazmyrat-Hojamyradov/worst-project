import { Controller, Get, Post, Param, Body, Put, Delete, UseInterceptors, UploadedFile, Query, NotFoundException } from '@nestjs/common';
import { UniversityService } from './university.service';
import { University } from '../../entities/university.entity';
import { CreateUniversityDto } from '../../auth/dto/create-university.dto';
import { UpdateUniversityDto } from '../../auth/dto/update-university.dto';
import { ApiTags, ApiResponse, ApiConsumes, ApiBody, ApiProperty } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { diskStorage } from 'multer';

@ApiTags('universities')
@Controller('api/universities')
export class UniversityController {
  constructor(private readonly service: UniversityService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Get all universities' })
  getAll(): Promise<University[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Get university by id' })
  @ApiResponse({ status: 404, description: 'University not found' })
  getOne(@Param('id') id: number): Promise<University | null> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiResponse({ status: 201, description: 'University created' })
  create(@Body() data: Partial<University>) {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiResponse({ status: 200, description: 'University updated' })
  update(@Param('id') id: number, @Body() data: Partial<University>) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'University deleted' })
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }

  // ✅ Upload photo
  @Post(':id/photo')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
          destination: path.join(__dirname, '..', 'uploads/universities'),
          filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, `${Date.now()}${ext}`);
          }
    })
  }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Photo uploaded' })
  async uploadPhoto(@Param('id') id: number, @UploadedFile() file: Express.Multer.File) {
    const photoUrl = `/uploads/universities/${file.filename}`;
    await this.service.update(id, { photoUrl });
    return { message: 'Photo uploaded', photoUrl };
  }

// @Get(':id')
// async getOne(
//   @Param('id') id: number,
//   @Query('lang') lang?: 'en' | 'ru' | 'tm'
// ) {
//   const uni = await this.service.findOne(id);
//   if (!uni) throw new NotFoundException();

//   if (lang) {
//     return {
//       id: uni.id,
//       name: uni.name[lang],
//       description: uni.description?.[lang],
//       requirements: uni.requirements?.[lang],
//       financing: uni.financing,
//       duration: uni.duration,
//       applicationDeadline: uni.applicationDeadline,
//       photoUrl: uni.photoUrl,
//     };
//   }

//   return uni; // return full translations if no lang query
// }
}
