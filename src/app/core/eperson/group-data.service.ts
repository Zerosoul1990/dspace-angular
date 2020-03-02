import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { createSelector, select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import {
  GroupRegistryCancelGroupAction,
  GroupRegistryEditGroupAction
} from '../../+admin/admin-access-control/group-registry/group-registry.actions';
import { GroupRegistryState } from '../../+admin/admin-access-control/group-registry/group-registry.reducers';
import { AppState } from '../../app.reducer';
import { hasValue } from '../../shared/empty.util';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { FollowLinkConfig } from '../../shared/utils/follow-link-config.model';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { SearchParam } from '../cache/models/search-param.model';
import { ObjectCacheService } from '../cache/object-cache.service';
import { DataService } from '../data/data.service';
import { DSOChangeAnalyzer } from '../data/dso-change-analyzer.service';
import { PaginatedList } from '../data/paginated-list';
import { RemoteData } from '../data/remote-data';
import { FindListOptions, FindListRequest } from '../data/request.models';

import { RequestService } from '../data/request.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { Group } from './models/group.model';
import { dataService } from '../cache/builders/build-decorators';
import { GROUP } from './models/group.resource-type';

const groupRegistryStateSelector = (state: AppState) => state.groupRegistry;
const editGroupSelector = createSelector(groupRegistryStateSelector, (groupRegistryState: GroupRegistryState) => groupRegistryState.editGroup);

/**
 * Provides methods to retrieve eperson group resources from the REST API & Group related CRUD actions.
 */
@Injectable({
  providedIn: 'root'
})
@dataService(GROUP)
export class GroupDataService extends DataService<Group> {
  protected linkPath = 'groups';
  protected browseEndpoint = '';

  constructor(
    protected comparator: DSOChangeAnalyzer<Group>,
    protected http: HttpClient,
    protected notificationsService: NotificationsService,
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected store: Store<any>,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService
  ) {
    super();
  }

  /**
   * Retrieves all groups
   * @param pagination The pagination info used to retrieve the groups
   */
  public getGroups(options: FindListOptions = {}, ...linksToFollow: Array<FollowLinkConfig<Group>>): Observable<RemoteData<PaginatedList<Group>>> {
    const hrefObs = this.getFindAllHref(options, this.linkPath, ...linksToFollow);
    hrefObs.pipe(
      filter((href: string) => hasValue(href)),
      take(1))
      .subscribe((href: string) => {
        const request = new FindListRequest(this.requestService.generateRequestId(), href, options);
        this.requestService.configure(request);
      });

    return this.rdbService.buildList<Group>(hrefObs) as Observable<RemoteData<PaginatedList<Group>>>;
  }

  /**
   * Returns a search result list of groups, with certain query (searches in group name and by exact uuid)
   * Endpoint used: /eperson/groups/search/byMetadata?query=<:name>
   * @param query     search query param
   * @param options
   * @param linksToFollow
   */
  public searchGroups(query: string, options?: FindListOptions, ...linksToFollow: Array<FollowLinkConfig<Group>>): Observable<RemoteData<PaginatedList<Group>>> {
    const searchParams = [new SearchParam('query', query)];
    let findListOptions = new FindListOptions();
    if (options) {
      findListOptions = Object.assign(new FindListOptions(), options);
    }
    if (findListOptions.searchParams) {
      findListOptions.searchParams = [...findListOptions.searchParams, ...searchParams];
    } else {
      findListOptions.searchParams = searchParams;
    }
    return this.searchBy('byMetadata', findListOptions, ...linksToFollow);
  }

  /**
   * Check if the current user is member of to the indicated group
   *
   * @param groupName
   *    the group name
   * @return boolean
   *    true if user is member of the indicated group, false otherwise
   */
  isMemberOf(groupName: string): Observable<boolean> {
    const searchHref = 'isMemberOf';
    const options = new FindListOptions();
    options.searchParams = [new SearchParam('groupName', groupName)];

    return this.searchBy(searchHref, options).pipe(
      filter((groups: RemoteData<PaginatedList<Group>>) => !groups.isResponsePending),
      take(1),
      map((groups: RemoteData<PaginatedList<Group>>) => groups.payload.totalElements > 0)
    );
  }

  /**
   * Method to delete a group
   * @param id The group id to delete
   */
  public deleteGroup(group: Group): Observable<boolean> {
    return this.delete(group);
  }

  /**
   * Create or Update a group
   *  If the group contains an id, it is assumed the eperson already exists and is updated instead
   *  //TODO
   * @param group    The group to create or update
   */
  public createOrUpdateGroup(group: Group): Observable<RemoteData<Group>> {
    const isUpdate = hasValue(group.id);
    if (isUpdate) {
      return this.updateGroup(group);
    } else {
      console.log('group create', group)
      return this.create(group, null);
    }
  }

  /**
   * // TODO
   * @param {DSpaceObject} ePerson The given object
   */
  updateGroup(group: Group): Observable<RemoteData<Group>> {
      // TODO
    return null;
  }

  /**
   * Method to retrieve the group that is currently being edited
   */
  public getActiveGroup(): Observable<Group> {
    return this.store.pipe(select(editGroupSelector))
  }

  /**
   * Method to cancel editing a group, dispatches a cancel group action
   */
  public cancelEditGroup() {
    this.store.dispatch(new GroupRegistryCancelGroupAction());
  }

  /**
   * Method to set the group being edited, dispatches an edit group action
   * @param group The group to edit
   */
  public editGroup(group: Group) {
    this.store.dispatch(new GroupRegistryEditGroupAction(group));
  }

  /**
   * Method that clears a cached groups request and returns its REST url
   */
  public clearGroupsRequests(): void {
    this.getBrowseEndpoint().pipe(take(1)).subscribe((link: string) => {
      this.requestService.removeByHrefSubstring(link);
    });
  }

}
