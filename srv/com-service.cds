using my.communitymanager as my from '../db/data-model';

service DisposalService {

  entity Buckets @readonly as projection on my.Buckets;
  entity Locations @readonly as projection on my.Locations;
  entity CallsForDisposal @insertonly as projection on my.CallsForDisposal;

}