import { injectable } from "inversify";
import { IDonation, IDonationCreator, IDonationEntity, IDonationFilters } from "../models/Donation";
import { IDonationService } from "../models/DonationService";
import { BaseMongoService } from "./BaseMongoService";
import { Cursor, ObjectID } from "mongodb";
import { IModifier } from "../models/Modifier";

@injectable()
export class MongoDonationService extends BaseMongoService<IDonationEntity, IDonation, IDonationFilters, IDonationCreator, IModifier> implements IDonationService {
  public static collectionName = "Donations";

  public getFilteredQuery({ paymentConfirmed }: IDonationFilters): Cursor<IDonationEntity> {
    if (paymentConfirmed !== undefined) {
      return this.collection.find({ paymentConfirmed });
    }
    return this.collection.find();
  }

  public async getByPackageId(packageId: string): Promise<IDonation[]> {
    const results = await this.collection.find({ packageId: new ObjectID(packageId) }).toArray()
    return results.map(this.toModel);
  }

  public async cleanPendingDonations(): Promise<number> {
    const result = await this.collection.deleteMany({ paymentConfirmed: false })
    return result.deletedCount || 0;
  }

  public toModel(entity: IDonationEntity): IDonation {
    return {
      id: entity._id.toString(),
      date: entity.date,
      email: entity.email,
      fullName: entity.fullName,
      packageId: entity.packageId,
      paymentConfirmed: entity.paymentConfirmed
    };
  }  
}