import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CentersService } from './centers.service';
import { CentersResolver } from './centers.resolver';
import { Center, CenterSchema } from './schemas/center.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Center.name, schema: CenterSchema }]),
    CloudinaryModule,
  ],
  providers: [CentersService, CentersResolver],
  exports: [CentersService],
})
export class CentersModule {}
