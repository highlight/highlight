import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { RouterModule } from '@angular/router'
import { HttpClientModule } from '@angular/common/http'
import { ReactiveFormsModule } from '@angular/forms'

import { AppComponent } from './app.component'
import { H } from 'highlight.run'

H.init('2', {
	environment: 'production',
	networkRecording: {
		enabled: true,
		recordHeadersAndBody: true,
	},
})

@NgModule({
	imports: [
		BrowserModule,
		HttpClientModule,
		ReactiveFormsModule,
		RouterModule.forRoot([]),
	],
	declarations: [AppComponent],
	bootstrap: [AppComponent],
})
export class AppModule {}
