import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { CentersService } from '../src/centers/centers.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const centersService = app.get(CentersService);

  const centers = await centersService.findAll();
  if (centers.length === 0) {
    console.log("No centers found.");
    await app.close();
    return;
  }

  const target = centers[0];
  console.log("Original center:", target.name, target.location);

  const newName = target.name + " (Updated)";
  const updated = await centersService.update(target._id.toString(), {
    id: target._id.toString(),
    name: newName,
    location: target.location,
    openingTime: target.openingTime,
    closingTime: target.closingTime
  });

  console.log("Updated center result:", updated?.name);

  // Verify
  const verify = await centersService.findOne(target._id.toString());
  console.log("Verified in DB:", verify?.name);

  await app.close();
}

bootstrap().catch(console.error);
