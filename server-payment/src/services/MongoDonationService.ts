import { inject, injectable } from "inversify";
import { Cursor, ObjectID } from "mongodb";
import { isAlpha, isEmail, isLength } from "validator";
import { IDonation, IDonationCreator, IDonationEntity, IDonationFilters } from "../models/Donation";
import { IDonationService } from "../models/DonationService";
import { FieldErrorCode } from "../models/Errors";
import { IModifier } from "../models/Modifier";
import { IPackageService } from "../models/PackageService";
import { Validator } from "../models/Validator";
import { TYPES } from "../types";
import { BaseMongoService } from "./BaseMongoService";

@injectable()
export class MongoDonationService
  extends BaseMongoService<IDonationEntity, IDonation, IDonationFilters, IDonationCreator, IModifier>
  implements IDonationService {
  public static collectionName = "donations";

  @inject(TYPES.IPackageService)
  private packageService: IPackageService = null as any;

  public creatorValidator: Validator<IDonationCreator> = {
    email: async value => {
      if (!isEmail(value)) return [FieldErrorCode.INVALID_EMAIL];
      return null;
    },
    fullName: async value => {
      if (!isAlpha(value.replace(/[ .]/g, ""))) return [FieldErrorCode.INVALID_NAME];
      else if (!isLength(value, { min: 1, max: 100 })) return [FieldErrorCode.INVALID_EMAIL];
      return null;
    },
    packageId: async value => {
      const donationPackage = await this.packageService.getById(value);
      if (!donationPackage) return [FieldErrorCode.PACKAGE_DOES_NOT_EXIST];
      return null;
    }
  };

  public getFilteredQuery({ paymentConfirmed }: IDonationFilters = {}): Cursor<IDonationEntity> {
    if (paymentConfirmed !== undefined) {
      return this.collection.find({ paymentConfirmed });
    }
    return this.collection.find();
  }

  public async getByPackageId(packageId: string): Promise<IDonation[]> {
    const results = await this.collection.find({ packageId: new ObjectID(packageId) }).toArray();
    return results.map(this.toModel);
  }

  public async countByPackageId(packageId: string): Promise<number> {
    return this.collection.find({ packageId: new ObjectID(packageId) }).count();
  }

  public async cleanPendingDonations(): Promise<number> {
    const result = await this.collection.deleteMany({ paymentConfirmed: false });
    return result.deletedCount || 0;
  }

  public async createEntity(creator: IDonationCreator): Promise<IDonationEntity> {
    const fromSuper = await super.createEntity(creator);
    return {
      ...fromSuper,
      paymentConfirmed: false,
      date: new Date()
    };
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
