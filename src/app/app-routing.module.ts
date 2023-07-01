import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AikidoComponent } from './navbar/aikido/aikido.component';


const routes: Routes = [


  {
    path: '',
    component: HomeComponent
   
  },

  { path: 'aikido', component: AikidoComponent },
  
  


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
