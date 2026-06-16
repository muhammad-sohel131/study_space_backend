import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Center } from './schemas/center.schema';
import { CreateCenterInput } from './dto/create-center.input';
import { UpdateCenterInput } from './dto/update-center.input';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PaginationArgs } from '../common/dto/pagination.args';
import { PaginatedCenters } from './dto/paginated-centers.response';

@Injectable()
export class CentersService {
  constructor(
    @InjectModel(Center.name) private centerModel: Model<Center>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createCenterInput: CreateCenterInput): Promise<Center> {
    const center = new this.centerModel(createCenterInput);
    return center.save();
  }

  async findAll(paginationArgs: PaginationArgs): Promise<PaginatedCenters> {
    const { page, limit } = paginationArgs;
    const skip = (page - 1) * limit;

    const [data, totalCount] = await Promise.all([
      this.centerModel.find().skip(skip).limit(limit).exec(),
      this.centerModel.countDocuments().exec()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data,
      totalCount,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Center | null> {
    return this.centerModel.findById(id).exec();
  }

  async update(id: string, updateCenterInput: UpdateCenterInput): Promise<Center | null> {
    const { id: _, ...updateData } = updateCenterInput;
    console.log('Updating center with ID:', id);
    console.log('Update data:', updateData);
    
    const existing = await this.centerModel.findById(id).exec();
    if (!existing) {
      console.error('Center not found for update, ID:', id);
      return null;
    }

    if (updateCenterInput.coverImage && existing.coverImage && existing.coverImage !== updateCenterInput.coverImage) {
      const publicId = this.getPublicIdFromUrl(existing.coverImage);
      if (publicId) await this.cloudinaryService.deleteImage(publicId);
    }

    const updated = await this.centerModel.findByIdAndUpdate(id, updateData, { returnDocument: 'after' }).exec();
    console.log('Update result:', updated ? 'Success' : 'Failed (null)');
    return updated;
  }

  async remove(id: string): Promise<boolean> {
    const existing = await this.centerModel.findById(id).exec();
    if (existing && existing.coverImage) {
      const publicId = this.getPublicIdFromUrl(existing.coverImage);
      if (publicId) await this.cloudinaryService.deleteImage(publicId);
    }
    const result = await this.centerModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  private getPublicIdFromUrl(url: string): string | null {
    try {
      const parts = url.split('/');
      const uploadIndex = parts.indexOf('upload');
      if (uploadIndex === -1) return null;
      // publicId starts after version (if exists) or after 'upload'
      const versionRegex = /^v\d+$/;
      const startIndex = versionRegex.test(parts[uploadIndex + 1]) ? uploadIndex + 2 : uploadIndex + 1;
      const publicIdWithExtension = parts.slice(startIndex).join('/');
      return publicIdWithExtension.split('.')[0];
    } catch (e) {
      return null;
    }
  }
}
