import { subHours } from "date-fns";
import { injectable } from "inversify";
import { Cursor, ObjectId } from "mongodb";
import { isAlpha, isEmail, isLength } from "validator";
import { DonationModel, DonationCreator, DonationEntity, DonationFilters, DonationModifier } from "../models/Donation";
import { IDonationService } from "../models/DonationService";
import { FieldErrorCode } from "../models/Errors";
import { Validator } from "../models/Validator";
import { BaseMongoService } from "./BaseMongoService";

@injectable()
export class MongoDonationService
  extends BaseMongoService<DonationEntity, DonationModel, DonationFilters, DonationCreator, DonationModifier>
  implements IDonationService {
  protected static collectionName = "donations";

  protected async createEntity(creator: DonationCreator): Promise<DonationEntity> {
    const fromSuper = await super.createEntity(creator);
    return {
      ...fromSuper,
      ...creator,
      paymentConfirmed: false,
      packageId: new ObjectId(creator.packageId),
      date: new Date()
    };
  }

  protected creatorValidator: Validator<DonationCreator> = {
    email: async value => {
      if (!isEmail(value)) return [FieldErrorCode.INVALID_EMAIL];
      return null;
    },
    fullName: async value => {
      if (!isAlpha(value.replace(/[ .]/g, ""))) return [FieldErrorCode.INVALID_NAME];
      else if (!isLength(value, { min: 1, max: 100 })) return [FieldErrorCode.INVALID_EMAIL];
      return null;
    },
    quantity: async value => {
      if (value <= 0) return [FieldErrorCode.INVALID_QUANTITY];
      return null;
    },
    customPriceAmount: async value => {
      if (value && value <= 0) return [FieldErrorCode.INVALID_AMOUNT];
      return null;
    }
  };

  protected getFilters = ({ paymentConfirmed }: DonationFilters = {}): object[] => {
    if (paymentConfirmed !== undefined) return [{ paymentConfirmed }];
    return [];
  };

  protected toModel = (entity: DonationEntity): DonationModel => {
    return {
      id: entity._id.toString(),
      date: entity.date,
      email: entity.email,
      fullName: entity.fullName,
      packageId: entity.packageId.toString(),
      notes: entity.notes,
      paymentConfirmed: entity.paymentConfirmed,
      quantity: entity.quantity,
      usingAmex: entity.usingAmex
    };
  };

  public cleanPendingDonations = async (): Promise<number> => {
    const result = await this.collection.deleteMany({
      paymentConfirmed: false,
      date: { $lt: subHours(new Date(), 1) }
    });
    return result.deletedCount || 0;
  };

  public confirmPayment = async (donationId: string): Promise<DonationModel | null> => {
    return this.edit({ id: donationId, paymentConfirmed: true });
  };

  public countByPackageId = (packageId: string): Promise<number> => {
    return this.collection.find({ packageId: new ObjectId(packageId) }).count();
  };

  public getByPackageId = async (packageId: string): Promise<DonationModel[]> => {
    const results = await this.collection.find({ packageId: new ObjectId(packageId) }).toArray();
    return results.map(this.toModel);
  };
}
