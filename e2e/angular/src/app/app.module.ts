import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { RouterModule } from '@angular/router'

import { H } from 'highlight.run'
import { AppComponent } from './app.component'

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
