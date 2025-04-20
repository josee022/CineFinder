import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Importamos los componentes standalone
import { PeopleListComponent } from './people-list/people-list.component';
import { PersonDetailComponent } from './person-detail/person-detail.component';
import { PeopleSearchComponent } from './people-search/people-search.component';

const routes: Routes = [
  { path: '', component: PeopleListComponent },
  { path: 'search', component: PeopleSearchComponent },
  { path: ':id', component: PersonDetailComponent },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: []
})
export class PeopleModule { }
