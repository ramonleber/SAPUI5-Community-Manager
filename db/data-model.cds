namespace my.communitymanager;
using { managed } from '@sap/cds/common';

  entity Buckets {
    key ID          : Integer;
    title           : String;
    location        : Association to Locations;
    locationName    : String;
    level           : Boolean;
  }

  entity Locations {
    key ID : Integer;
    name   : String;
    bucket : Association to Buckets on bucket.location = $self;
    long   : Decimal;
    lat    : Decimal;
  }

  entity CallsForDisposal : managed {
    key ID  : UUID;
    bucket  : Association to Buckets;
    level   : Boolean;
  }