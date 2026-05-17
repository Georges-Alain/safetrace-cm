import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export default class PendingCase extends Model {
  static table = 'pending_cases';

  @field('person_name') personName;
  @field('person_age') personAge;
  @field('person_gender') personGender;
  @field('last_seen_location') lastSeenLocation;
  @field('description') description;
  @field('photo_uri') photoUri;
  @field('latitude') latitude;
  @field('longitude') longitude;
  @field('last_seen_at') lastSeenAt;
  @field('synced') synced;
  @readonly @date('created_at_local') createdAtLocal;
}
