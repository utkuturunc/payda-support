import { inject, injectable } from "inversify";
import { PackageService } from "../models/PackageService";
import { PaginationSettings } from "../models/PaginationSettings";
import { RepeatInterval } from "../models/RepeatInterval";
import { SortingSettings } from "../models/SortingSettings";
import { RunningSubscriptionModel, SubscriptionFilters } from "../models/Subscription";
import { SubscriptionManagerService } from "../models/SubscriptionManagerService";
import { SubscriptionService } from "../models/SubscriptionService";
import { TYPES } from "../types";

@injectable()
export class SubscriptionManagerServiceImpl implements SubscriptionManagerService {
  @inject(TYPES.PackageService)
  private packageService: PackageService = null as any;

  @inject(TYPES.SubscriptionService)
  private subscriptionService: SubscriptionService = null as any;

  public getChargableSubscriptions = async (
    repeatInterval: RepeatInterval,
    filters: SubscriptionFilters,
    pagination: PaginationSettings,
    sorting: SortingSettings
  ): Promise<RunningSubscriptionModel[]> => {
    const allowedPackages = await this.packageService.getByRepeatInterval(repeatInterval);
    const allowedPackageIds = allowedPackages.map(p => p.id);
    return this.subscriptionService.getByChargableSubscriptionsForRepeatIntervalAndPackageIds(
      repeatInterval,
      allowedPackageIds,
      filters,
      pagination,
      sorting
    );
  };

  public countChargableSubscriptions = async (
    repeatInterval: RepeatInterval,
    filters: SubscriptionFilters
  ): Promise<number> => {
    const allowedPackages = await this.packageService.getByRepeatInterval(repeatInterval);
    const allowedPackageIds = allowedPackages.map(p => p.id);
    return this.subscriptionService.countChargableSubscriptionsForRepeatIntervalAndPackageIds(
      repeatInterval,
      allowedPackageIds,
      filters
    );
  };

  public getChargableSubscriptionById = async (
    id: string,
    repeatInterval: RepeatInterval
  ): Promise<RunningSubscriptionModel | null> => {
    const allowedPackages = await this.packageService.getByRepeatInterval(repeatInterval);
    const allowedPackageIds = allowedPackages.map(p => p.id);
    return this.subscriptionService.getByIdForRepeatIntervalAndPackageIds(id, repeatInterval, allowedPackageIds);
  };
}