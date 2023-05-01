const mui4SynderGrid = `
.MuiGrid-container {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  box-sizing: border-box;
}
.MuiGrid-item {
  margin: 0;
  box-sizing: border-box;
}
.MuiGrid-zeroMinWidth {
  min-width: 0;
}
.MuiGrid-direction-xs-column {
  flex-direction: column;
}
.MuiGrid-direction-xs-column-reverse {
  flex-direction: column-reverse;
}
.MuiGrid-direction-xs-row-reverse {
  flex-direction: row-reverse;
}
.MuiGrid-wrap-xs-nowrap {
  flex-wrap: nowrap;
}
.MuiGrid-wrap-xs-wrap-reverse {
  flex-wrap: wrap-reverse;
}
.MuiGrid-align-items-xs-center {
  align-items: center;
}
.MuiGrid-align-items-xs-flex-start {
  align-items: flex-start;
}
.MuiGrid-align-items-xs-flex-end {
  align-items: flex-end;
}
.MuiGrid-align-items-xs-baseline {
  align-items: baseline;
}
.MuiGrid-align-content-xs-center {
  align-content: center;
}
.MuiGrid-align-content-xs-flex-start {
  align-content: flex-start;
}
.MuiGrid-align-content-xs-flex-end {
  align-content: flex-end;
}
.MuiGrid-align-content-xs-space-between {
  align-content: space-between;
}
.MuiGrid-align-content-xs-space-around {
  align-content: space-around;
}
.MuiGrid-justify-content-xs-center {
  justify-content: center;
}
.MuiGrid-justify-content-xs-flex-end {
  justify-content: flex-end;
}
.MuiGrid-justify-content-xs-space-between {
  justify-content: space-between;
}
.MuiGrid-justify-content-xs-space-around {
  justify-content: space-around;
}
.MuiGrid-justify-content-xs-space-evenly {
  justify-content: space-evenly;
}
.MuiGrid-spacing-xs-1 {
  width: calc(100% + 8px);
  margin: -4px;
}
.MuiGrid-spacing-xs-1 > .MuiGrid-item {
  padding: 4px;
}
.MuiGrid-spacing-xs-2 {
  width: calc(100% + 16px);
  margin: -8px;
}
.MuiGrid-spacing-xs-2 > .MuiGrid-item {
  padding: 8px;
}
.MuiGrid-spacing-xs-3 {
  width: calc(100% + 24px);
  margin: -12px;
}
.MuiGrid-spacing-xs-3 > .MuiGrid-item {
  padding: 12px;
}
.MuiGrid-spacing-xs-4 {
  width: calc(100% + 32px);
  margin: -16px;
}
.MuiGrid-spacing-xs-4 > .MuiGrid-item {
  padding: 16px;
}
.MuiGrid-spacing-xs-5 {
  width: calc(100% + 40px);
  margin: -20px;
}
.MuiGrid-spacing-xs-5 > .MuiGrid-item {
  padding: 20px;
}
.MuiGrid-spacing-xs-6 {
  width: calc(100% + 48px);
  margin: -24px;
}
.MuiGrid-spacing-xs-6 > .MuiGrid-item {
  padding: 24px;
}
.MuiGrid-spacing-xs-7 {
  width: calc(100% + 56px);
  margin: -28px;
}
.MuiGrid-spacing-xs-7 > .MuiGrid-item {
  padding: 28px;
}
.MuiGrid-spacing-xs-8 {
  width: calc(100% + 64px);
  margin: -32px;
}
.MuiGrid-spacing-xs-8 > .MuiGrid-item {
  padding: 32px;
}
.MuiGrid-spacing-xs-9 {
  width: calc(100% + 72px);
  margin: -36px;
}
.MuiGrid-spacing-xs-9 > .MuiGrid-item {
  padding: 36px;
}
.MuiGrid-spacing-xs-10 {
  width: calc(100% + 80px);
  margin: -40px;
}
.MuiGrid-spacing-xs-10 > .MuiGrid-item {
  padding: 40px;
}
.MuiGrid-grid-xs-auto {
  flex-grow: 0;
  max-width: none;
  flex-basis: auto;
}
.MuiGrid-grid-xs-true {
  flex-grow: 1;
  max-width: 100%;
  flex-basis: 0;
}
.MuiGrid-grid-xs-1 {
  flex-grow: 0;
  max-width: 8.333333%;
  flex-basis: 8.333333%;
}
.MuiGrid-grid-xs-2 {
  flex-grow: 0;
  max-width: 16.666667%;
  flex-basis: 16.666667%;
}
.MuiGrid-grid-xs-3 {
  flex-grow: 0;
  max-width: 25%;
  flex-basis: 25%;
}
.MuiGrid-grid-xs-4 {
  flex-grow: 0;
  max-width: 33.333333%;
  flex-basis: 33.333333%;
}
.MuiGrid-grid-xs-5 {
  flex-grow: 0;
  max-width: 41.666667%;
  flex-basis: 41.666667%;
}
.MuiGrid-grid-xs-6 {
  flex-grow: 0;
  max-width: 50%;
  flex-basis: 50%;
}
.MuiGrid-grid-xs-7 {
  flex-grow: 0;
  max-width: 58.333333%;
  flex-basis: 58.333333%;
}
.MuiGrid-grid-xs-8 {
  flex-grow: 0;
  max-width: 66.666667%;
  flex-basis: 66.666667%;
}
.MuiGrid-grid-xs-9 {
  flex-grow: 0;
  max-width: 75%;
  flex-basis: 75%;
}
.MuiGrid-grid-xs-10 {
  flex-grow: 0;
  max-width: 83.333333%;
  flex-basis: 83.333333%;
}
.MuiGrid-grid-xs-11 {
  flex-grow: 0;
  max-width: 91.666667%;
  flex-basis: 91.666667%;
}
.MuiGrid-grid-xs-12 {
  flex-grow: 0;
  max-width: 100%;
  flex-basis: 100%;
}
@media (min-width:600px) {
  .MuiGrid-grid-sm-auto {
    flex-grow: 0;
    max-width: none;
    flex-basis: auto;
  }
  .MuiGrid-grid-sm-true {
    flex-grow: 1;
    max-width: 100%;
    flex-basis: 0;
  }
  .MuiGrid-grid-sm-1 {
    flex-grow: 0;
    max-width: 8.333333%;
    flex-basis: 8.333333%;
  }
  .MuiGrid-grid-sm-2 {
    flex-grow: 0;
    max-width: 16.666667%;
    flex-basis: 16.666667%;
  }
  .MuiGrid-grid-sm-3 {
    flex-grow: 0;
    max-width: 25%;
    flex-basis: 25%;
  }
  .MuiGrid-grid-sm-4 {
    flex-grow: 0;
    max-width: 33.333333%;
    flex-basis: 33.333333%;
  }
  .MuiGrid-grid-sm-5 {
    flex-grow: 0;
    max-width: 41.666667%;
    flex-basis: 41.666667%;
  }
  .MuiGrid-grid-sm-6 {
    flex-grow: 0;
    max-width: 50%;
    flex-basis: 50%;
  }
  .MuiGrid-grid-sm-7 {
    flex-grow: 0;
    max-width: 58.333333%;
    flex-basis: 58.333333%;
  }
  .MuiGrid-grid-sm-8 {
    flex-grow: 0;
    max-width: 66.666667%;
    flex-basis: 66.666667%;
  }
  .MuiGrid-grid-sm-9 {
    flex-grow: 0;
    max-width: 75%;
    flex-basis: 75%;
  }
  .MuiGrid-grid-sm-10 {
    flex-grow: 0;
    max-width: 83.333333%;
    flex-basis: 83.333333%;
  }
  .MuiGrid-grid-sm-11 {
    flex-grow: 0;
    max-width: 91.666667%;
    flex-basis: 91.666667%;
  }
  .MuiGrid-grid-sm-12 {
    flex-grow: 0;
    max-width: 100%;
    flex-basis: 100%;
  }
}
@media (min-width:960px) {
  .MuiGrid-grid-md-auto {
    flex-grow: 0;
    max-width: none;
    flex-basis: auto;
  }
  .MuiGrid-grid-md-true {
    flex-grow: 1;
    max-width: 100%;
    flex-basis: 0;
  }
  .MuiGrid-grid-md-1 {
    flex-grow: 0;
    max-width: 8.333333%;
    flex-basis: 8.333333%;
  }
  .MuiGrid-grid-md-2 {
    flex-grow: 0;
    max-width: 16.666667%;
    flex-basis: 16.666667%;
  }
  .MuiGrid-grid-md-3 {
    flex-grow: 0;
    max-width: 25%;
    flex-basis: 25%;
  }
  .MuiGrid-grid-md-4 {
    flex-grow: 0;
    max-width: 33.333333%;
    flex-basis: 33.333333%;
  }
  .MuiGrid-grid-md-5 {
    flex-grow: 0;
    max-width: 41.666667%;
    flex-basis: 41.666667%;
  }
  .MuiGrid-grid-md-6 {
    flex-grow: 0;
    max-width: 50%;
    flex-basis: 50%;
  }
  .MuiGrid-grid-md-7 {
    flex-grow: 0;
    max-width: 58.333333%;
    flex-basis: 58.333333%;
  }
  .MuiGrid-grid-md-8 {
    flex-grow: 0;
    max-width: 66.666667%;
    flex-basis: 66.666667%;
  }
  .MuiGrid-grid-md-9 {
    flex-grow: 0;
    max-width: 75%;
    flex-basis: 75%;
  }
  .MuiGrid-grid-md-10 {
    flex-grow: 0;
    max-width: 83.333333%;
    flex-basis: 83.333333%;
  }
  .MuiGrid-grid-md-11 {
    flex-grow: 0;
    max-width: 91.666667%;
    flex-basis: 91.666667%;
  }
  .MuiGrid-grid-md-12 {
    flex-grow: 0;
    max-width: 100%;
    flex-basis: 100%;
  }
}
@media (min-width:1280px) {
  .MuiGrid-grid-lg-auto {
    flex-grow: 0;
    max-width: none;
    flex-basis: auto;
  }
  .MuiGrid-grid-lg-true {
    flex-grow: 1;
    max-width: 100%;
    flex-basis: 0;
  }
  .MuiGrid-grid-lg-1 {
    flex-grow: 0;
    max-width: 8.333333%;
    flex-basis: 8.333333%;
  }
  .MuiGrid-grid-lg-2 {
    flex-grow: 0;
    max-width: 16.666667%;
    flex-basis: 16.666667%;
  }
  .MuiGrid-grid-lg-3 {
    flex-grow: 0;
    max-width: 25%;
    flex-basis: 25%;
  }
  .MuiGrid-grid-lg-4 {
    flex-grow: 0;
    max-width: 33.333333%;
    flex-basis: 33.333333%;
  }
  .MuiGrid-grid-lg-5 {
    flex-grow: 0;
    max-width: 41.666667%;
    flex-basis: 41.666667%;
  }
  .MuiGrid-grid-lg-6 {
    flex-grow: 0;
    max-width: 50%;
    flex-basis: 50%;
  }
  .MuiGrid-grid-lg-7 {
    flex-grow: 0;
    max-width: 58.333333%;
    flex-basis: 58.333333%;
  }
  .MuiGrid-grid-lg-8 {
    flex-grow: 0;
    max-width: 66.666667%;
    flex-basis: 66.666667%;
  }
  .MuiGrid-grid-lg-9 {
    flex-grow: 0;
    max-width: 75%;
    flex-basis: 75%;
  }
  .MuiGrid-grid-lg-10 {
    flex-grow: 0;
    max-width: 83.333333%;
    flex-basis: 83.333333%;
  }
  .MuiGrid-grid-lg-11 {
    flex-grow: 0;
    max-width: 91.666667%;
    flex-basis: 91.666667%;
  }
  .MuiGrid-grid-lg-12 {
    flex-grow: 0;
    max-width: 100%;
    flex-basis: 100%;
  }
}
@media (min-width:1920px) {
  .MuiGrid-grid-xl-auto {
    flex-grow: 0;
    max-width: none;
    flex-basis: auto;
  }
  .MuiGrid-grid-xl-true {
    flex-grow: 1;
    max-width: 100%;
    flex-basis: 0;
  }
  .MuiGrid-grid-xl-1 {
    flex-grow: 0;
    max-width: 8.333333%;
    flex-basis: 8.333333%;
  }
  .MuiGrid-grid-xl-2 {
    flex-grow: 0;
    max-width: 16.666667%;
    flex-basis: 16.666667%;
  }
  .MuiGrid-grid-xl-3 {
    flex-grow: 0;
    max-width: 25%;
    flex-basis: 25%;
  }
  .MuiGrid-grid-xl-4 {
    flex-grow: 0;
    max-width: 33.333333%;
    flex-basis: 33.333333%;
  }
  .MuiGrid-grid-xl-5 {
    flex-grow: 0;
    max-width: 41.666667%;
    flex-basis: 41.666667%;
  }
  .MuiGrid-grid-xl-6 {
    flex-grow: 0;
    max-width: 50%;
    flex-basis: 50%;
  }
  .MuiGrid-grid-xl-7 {
    flex-grow: 0;
    max-width: 58.333333%;
    flex-basis: 58.333333%;
  }
  .MuiGrid-grid-xl-8 {
    flex-grow: 0;
    max-width: 66.666667%;
    flex-basis: 66.666667%;
  }
  .MuiGrid-grid-xl-9 {
    flex-grow: 0;
    max-width: 75%;
    flex-basis: 75%;
  }
  .MuiGrid-grid-xl-10 {
    flex-grow: 0;
    max-width: 83.333333%;
    flex-basis: 83.333333%;
  }
  .MuiGrid-grid-xl-11 {
    flex-grow: 0;
    max-width: 91.666667%;
    flex-basis: 91.666667%;
  }
  .MuiGrid-grid-xl-12 {
    flex-grow: 0;
    max-width: 100%;
    flex-basis: 100%;
  }
}`

const mui4SynderTypography = `.MuiTypography-root {
  margin: 0;
}
.MuiTypography-body2 {
  font-size: 16px;
  font-family: Roboto;
  font-weight: 900;
  line-height: 1.43;
}
.MuiTypography-body1 {
  font-size: 16px;
  font-family: Roboto;
  font-weight: 400;
  line-height: 1.5;
}
.MuiTypography-caption {
  font-size: 0.75rem;
  font-family: Roboto;
  font-weight: 400;
  line-height: 1.66;
}
.MuiTypography-button {
  font-size: 0.875rem;
  font-family: Roboto;
  font-weight: 500;
  line-height: 1.75;
  text-transform: uppercase;
}
.MuiTypography-h1 {
  font-size: 28px;
  font-family: Roboto;
  font-weight: 300;
  line-height: 1.167;
}
.MuiTypography-h2 {
  font-size: 20px;
  font-family: Roboto;
  font-weight: 300;
  line-height: 1.2;
}
.MuiTypography-h3 {
  font-size: 3rem;
  font-family: Roboto;
  font-weight: 400;
  line-height: 1.167;
}
.MuiTypography-h4 {
  font-size: 2.125rem;
  font-family: Roboto;
  font-weight: 400;
  line-height: 1.235;
}
.MuiTypography-h5 {
  font-size: 1.5rem;
  font-family: Roboto;
  font-weight: 400;
  line-height: 1.334;
}
.MuiTypography-h6 {
  font-size: 1.25rem;
  font-family: Roboto;
  font-weight: 500;
  line-height: 1.6;
}
.MuiTypography-subtitle1 {
  color: #6B778C;
  font-size: 16px;
  font-family: Roboto;
  font-weight: 400;
  line-height: 1.75;
}
.MuiTypography-subtitle2 {
  font-size: 16px;
  font-family: Roboto;
  font-weight: 500;
  line-height: 1.57;
}
.MuiTypography-overline {
  font-size: 0.75rem;
  font-family: Roboto;
  font-weight: 400;
  line-height: 2.66;
  text-transform: uppercase;
}
.MuiTypography-srOnly {
  width: 1px;
  height: 1px;
  overflow: hidden;
  position: absolute;
}
.MuiTypography-alignLeft {
  text-align: left;
}
.MuiTypography-alignCenter {
  text-align: center;
}
.MuiTypography-alignRight {
  text-align: right;
}
.MuiTypography-alignJustify {
  text-align: justify;
}
.MuiTypography-noWrap {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.MuiTypography-gutterBottom {
  margin-bottom: 0.35em;
}
.MuiTypography-paragraph {
  margin-bottom: 16px;
}
.MuiTypography-colorInherit {
  color: inherit;
}
.MuiTypography-colorPrimary {
  color: #0053CC;
}
.MuiTypography-colorSecondary {
  color: #f44336;
}
.MuiTypography-colorTextPrimary {
  color: rgba(0, 0, 0, 0.87);
}
.MuiTypography-colorTextSecondary {
  color: rgba(0, 0, 0, 0.54);
}
.MuiTypography-colorError {
  color: #f44336;
}
.MuiTypography-displayInline {
  display: inline;
}
.MuiTypography-displayBlock {
  display: block;
}
.footer-section-jss4 {
	margin: 0;
}

.footer-section-jss5 {
	font-size: 14px;
	font-family: Roboto;
	font-weight: 900;
	line-height: 1.43;
}

.footer-section-jss6 {
	font-size: 14px;
	font-family: Roboto;
	font-weight: 400;
	line-height: 1.5;
}

.footer-section-jss7 {
	font-size: 0.75rem;
	font-family: Roboto;
	font-weight: 400;
	line-height: 1.66;
}

.footer-section-jss8 {
	font-size: 0.875rem;
	font-family: Roboto;
	font-weight: 500;
	line-height: 1.75;
	text-transform: uppercase;
}

.footer-section-jss9 {
	font-size: 28px;
	font-family: Roboto;
	font-weight: 300;
	line-height: 1.167;
}

.footer-section-jss10 {
	font-size: 20px;
	font-family: Roboto;
	font-weight: 300;
	line-height: 1.2;
}

.footer-section-jss11 {
	font-size: 3rem;
	font-family: Roboto;
	font-weight: 400;
	line-height: 1.167;
}

.footer-section-jss12 {
	font-size: 2.125rem;
	font-family: Roboto;
	font-weight: 400;
	line-height: 1.235;
}

.footer-section-jss13 {
	font-size: 1.5rem;
	font-family: Roboto;
	font-weight: 400;
	line-height: 1.334;
}

.footer-section-jss14 {
	font-size: 1.25rem;
	font-family: Roboto;
	font-weight: 500;
	line-height: 1.6;
}

.footer-section-jss15 {
	color: #6B778C;
	font-size: 14px;
	font-family: Roboto;
	font-weight: 400;
	line-height: 1.75;
}

.footer-section-jss16 {
	font-size: 16px;
	font-family: Roboto;
	font-weight: 500;
	line-height: 1.57;
}

.footer-section-jss17 {
	font-size: 0.75rem;
	font-family: Roboto;
	font-weight: 400;
	line-height: 2.66;
	text-transform: uppercase;
}

.footer-section-jss18 {
	width: 1px;
	height: 1px;
	overflow: hidden;
	position: absolute;
}

.footer-section-jss19 {
	text-align: left;
}

.footer-section-jss20 {
	text-align: center;
}

.footer-section-jss21 {
	text-align: right;
}

.footer-section-jss22 {
	text-align: justify;
}

.footer-section-jss23 {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.footer-section-jss24 {
	margin-bottom: 0.35em;
}

.footer-section-jss25 {
	margin-bottom: 16px;
}

.footer-section-jss26 {
	color: inherit;
}

.footer-section-jss27 {
	color: #0053CC;
}

.footer-section-jss28 {
	color: #f44336;
}

.footer-section-jss29 {
	color: rgba(0, 0, 0, 0.87);
}

.footer-section-jss30 {
	color: rgba(0, 0, 0, 0.54);
}

.footer-section-jss31 {
	color: #f44336;
}

.footer-section-jss32 {
	display: inline;
}

.footer-section-jss33 {
	display: block;
}
`
const mui4SynderTouchRipple = `
.MuiTouchRipple-root-379 {
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 0;
	overflow: hidden;
	position: absolute;
	border-radius: inherit;
	pointer-events: none;
}

.MuiTouchRipple-ripple-380 {
	opacity: 0;
	position: absolute;
}

.MuiTouchRipple-rippleVisible-381 {
	opacity: 0.3;
	animation: MuiTouchRipple-keyframes-enter-386 550ms cubic-bezier(0.4, 0, 0.2, 1);
	transform: scale(1);
}

.MuiTouchRipple-ripplePulsate-382 {
	animation-duration: 200ms;
}

.MuiTouchRipple-child-383 {
	width: 100%;
	height: 100%;
	display: block;
	opacity: 1;
	border-radius: 50%;
	background-color: currentColor;
}

.MuiTouchRipple-childLeaving-384 {
	opacity: 0;
	animation: MuiTouchRipple-keyframes-exit-387 550ms cubic-bezier(0.4, 0, 0.2, 1);
}

.MuiTouchRipple-childPulsate-385 {
	top: 0;
	left: 0;
	position: absolute;
	animation: MuiTouchRipple-keyframes-pulsate-388 2500ms cubic-bezier(0.4, 0, 0.2, 1) 200ms infinite;
}

@-webkit-keyframes MuiTouchRipple-keyframes-enter-386 {
	0% {
		opacity: 0.1;
		transform: scale(0);
	}
	100% {
		opacity: 0.3;
		transform: scale(1);
	}
}

@-webkit-keyframes MuiTouchRipple-keyframes-exit-387 {
	0% {
		opacity: 1;
	}
	100% {
		opacity: 0;
	}
}

@-webkit-keyframes MuiTouchRipple-keyframes-pulsate-388 {
	0% {
		transform: scale(1);
	}
	50% {
		transform: scale(0.92);
	}
	100% {
		transform: scale(1);
	}
}
.MuiTouchRipple-root-421 {
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 0;
	overflow: hidden;
	position: absolute;
	border-radius: inherit;
	pointer-events: none;
}

.MuiTouchRipple-ripple-422 {
	opacity: 0;
	position: absolute;
}

.MuiTouchRipple-rippleVisible-423 {
	opacity: 0.3;
	animation: MuiTouchRipple-keyframes-enter-428 550ms cubic-bezier(0.4, 0, 0.2, 1);
	transform: scale(1);
}

.MuiTouchRipple-ripplePulsate-424 {
	animation-duration: 200ms;
}

.MuiTouchRipple-child-425 {
	width: 100%;
	height: 100%;
	display: block;
	opacity: 1;
	border-radius: 50%;
	background-color: currentColor;
}

.MuiTouchRipple-childLeaving-426 {
	opacity: 0;
	animation: MuiTouchRipple-keyframes-exit-429 550ms cubic-bezier(0.4, 0, 0.2, 1);
}

.MuiTouchRipple-childPulsate-427 {
	top: 0;
	left: 0;
	position: absolute;
	animation: MuiTouchRipple-keyframes-pulsate-430 2500ms cubic-bezier(0.4, 0, 0.2, 1) 200ms infinite;
}

@-webkit-keyframes MuiTouchRipple-keyframes-enter-428 {
	0% {
		opacity: 0.1;
		transform: scale(0);
	}
	100% {
		opacity: 0.3;
		transform: scale(1);
	}
}

@-webkit-keyframes MuiTouchRipple-keyframes-exit-429 {
	0% {
		opacity: 1;
	}
	100% {
		opacity: 0;
	}
}

@-webkit-keyframes MuiTouchRipple-keyframes-pulsate-430 {
	0% {
		transform: scale(1);
	}
	50% {
		transform: scale(0.92);
	}
	100% {
		transform: scale(1);
	}
}
`
const mui4SynderButtonBase = `
.MuiButtonBase-root-378 {
	color: inherit;
	border: 0;
	cursor: pointer;
	margin: 0;
	display: inline-flex;
	outline: 0;
	padding: 0;
	position: relative;
	box-shadow: none !important;
	align-items: center;
	user-select: none;
	border-radius: 0;
	vertical-align: middle;
	-moz-appearance: none;
	justify-content: center;
	text-decoration: none;
	background-color: transparent;
	-webkit-appearance: none;
	-webkit-tap-highlight-color: transparent;
}

.MuiButtonBase-root-378::-moz-focus-inner {
	border-style: none;
}

.MuiButtonBase-root-378.Mui-disabled {
	cursor: default;
	pointer-events: none;
}

@media print {
	.MuiButtonBase-root-378 {
		-webkit-print-color-adjust: exact;
	}
}
.MuiButtonBase-root {
	color: inherit;
	border: 0;
	cursor: pointer;
	margin: 0;
	display: inline-flex;
	outline: 0;
	padding: 0;
	position: relative;
	box-shadow: none !important;
	align-items: center;
	user-select: none;
	border-radius: 0;
	vertical-align: middle;
	-moz-appearance: none;
	justify-content: center;
	text-decoration: none;
	background-color: transparent;
	-webkit-appearance: none;
	-webkit-tap-highlight-color: transparent;
}

.MuiButtonBase-root::-moz-focus-inner {
	border-style: none;
}

.MuiButtonBase-root.Mui-disabled {
	cursor: default;
	pointer-events: none;
}

@media print {
	.MuiButtonBase-root {
		-webkit-print-color-adjust: exact;
	}
}
.MuiButtonBase-root-420 {
	color: inherit;
	border: 0;
	cursor: pointer;
	margin: 0;
	display: inline-flex;
	outline: 0;
	padding: 0;
	position: relative;
	box-shadow: none !important;
	align-items: center;
	user-select: none;
	border-radius: 0;
	vertical-align: middle;
	-moz-appearance: none;
	justify-content: center;
	text-decoration: none;
	background-color: transparent;
	-webkit-appearance: none;
	-webkit-tap-highlight-color: transparent;
}

.MuiButtonBase-root-420::-moz-focus-inner {
	border-style: none;
}

.MuiButtonBase-root-420.Mui-disabled {
	cursor: default;
	pointer-events: none;
}

@media print {
	.MuiButtonBase-root-420 {
		-webkit-print-color-adjust: exact;
	}
}
.MuiButton-root-351 {
	color: rgba(0, 0, 0, 0.87);
	padding: 6px 19px;
	font-size: 0.875rem;
	min-width: 64px;
	box-sizing: border-box;
	transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
	font-family: Roboto;
	font-weight: 500;
	line-height: 1.45;
	border-radius: 4px;
	text-transform: uppercase;
}

.MuiButton-root-351:hover {
	text-decoration: none;
	background-color: rgba(0, 0, 0, 0.04);
}

.MuiButton-root-351.Mui-disabled {
	color: rgba(0, 0, 0, 0.26);
}

@media (hover: none) {
	.MuiButton-root-351:hover {
		background-color: transparent;
	}
}

.MuiButton-root-351:hover.Mui-disabled {
	background-color: transparent;
}

.MuiButton-label-352 {
	width: 100%;
	display: inherit;
	font-size: 16px;
	align-items: inherit;
	text-transform: initial;
	justify-content: inherit;
}

.MuiButton-text-353 {
	padding: 6px 8px;
}

.MuiButton-textPrimary-354 {
	color: #0053CC;
}

.MuiButton-textPrimary-354:hover {
	background-color: rgba(0, 83, 204, 0.04);
}

@media (hover: none) {
	.MuiButton-textPrimary-354:hover {
		background-color: transparent;
	}
}

.MuiButton-textSecondary-355 {
	color: #f44336;
}

.MuiButton-textSecondary-355:hover {
	background-color: rgba(244, 67, 54, 0.04);
}

@media (hover: none) {
	.MuiButton-textSecondary-355:hover {
		background-color: transparent;
	}
}

.MuiButton-outlined-356 {
	border: 1px solid rgba(0, 0, 0, 0.23);
	padding: 5px 18px;
}

.MuiButton-outlined-356.Mui-disabled {
	border: 1px solid rgba(0, 0, 0, 0.12);
}

.MuiButton-outlinedPrimary-357 {
	color: #0053CC;
	border: 1px solid rgba(0, 83, 204, 0.5);
}

.MuiButton-outlinedPrimary-357:hover {
	border: 1px solid #0053CC;
	background-color: rgba(0, 83, 204, 0.04);
}

@media (hover: none) {
	.MuiButton-outlinedPrimary-357:hover {
		background-color: transparent;
	}
}

.MuiButton-outlinedSecondary-358 {
	color: #f44336;
	border: 1px solid rgba(244, 67, 54, 0.5);
}

.MuiButton-outlinedSecondary-358:hover {
	border: 1px solid #f44336;
	background-color: rgba(244, 67, 54, 0.04);
}

.MuiButton-outlinedSecondary-358.Mui-disabled {
	border: 1px solid rgba(0, 0, 0, 0.26);
}

@media (hover: none) {
	.MuiButton-outlinedSecondary-358:hover {
		background-color: transparent;
	}
}

.MuiButton-contained-359 {
	color: rgba(0, 0, 0, 0.87);
	box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
	background-color: #e0e0e0;
}

.MuiButton-contained-359:hover {
	box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);
	background-color: #d5d5d5;
}

.MuiButton-contained-359.Mui-focusVisible {
	box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12);
}

.MuiButton-contained-359:active {
	box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12);
}

.MuiButton-contained-359.Mui-disabled {
	color: rgba(0, 0, 0, 0.26);
	box-shadow: none;
	background-color: rgba(0, 0, 0, 0.12);
}

@media (hover: none) {
	.MuiButton-contained-359:hover {
		box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
		background-color: #e0e0e0;
	}
}

.MuiButton-contained-359:hover.Mui-disabled {
	background-color: rgba(0, 0, 0, 0.12);
}

.MuiButton-containedPrimary-360 {
	color: #fff !important;
	background-color: #0053CC;
}

.MuiButton-containedPrimary-360:hover {
	background-color: #0044A8;
}

@media (hover: none) {
	.MuiButton-containedPrimary-360:hover {
		background-color: #0053CC;
	}
}

.MuiButton-containedSecondary-361 {
	color: #fff;
	background-color: #f44336;
}

.MuiButton-containedSecondary-361:hover {
	background-color: #d32f2f;
}

@media (hover: none) {
	.MuiButton-containedSecondary-361:hover {
		background-color: #f44336;
	}
}

.MuiButton-disableElevation-362 {
	box-shadow: none;
}

.MuiButton-disableElevation-362:hover {
	box-shadow: none;
}

.MuiButton-disableElevation-362.Mui-focusVisible {
	box-shadow: none;
}

.MuiButton-disableElevation-362:active {
	box-shadow: none;
}

.MuiButton-disableElevation-362.Mui-disabled {
	box-shadow: none;
}

.MuiButton-colorInherit-363 {
	color: inherit;
	border-color: currentColor;
}

.MuiButton-textSizeSmall-364 {
	padding: 4px 5px;
	font-size: 0.8125rem;
}

.MuiButton-textSizeLarge-365 {
	padding: 8px 11px;
	font-size: 0.9375rem;
}

.MuiButton-outlinedSizeSmall-366 {
	padding: 3px 9px;
	font-size: 0.8125rem;
}

.MuiButton-outlinedSizeLarge-367 {
	padding: 7px 21px;
	font-size: 0.9375rem;
}

.MuiButton-containedSizeSmall-368 {
	padding: 4px 10px;
	font-size: 0.8125rem;
}

.MuiButton-containedSizeLarge-369 {
	padding: 8px 22px;
	font-size: 0.9375rem;
}

.MuiButton-fullWidth-372 {
	width: 100%;
}

.MuiButton-startIcon-373 {
	display: inherit;
	margin-left: -4px;
	margin-right: 8px;
}

.MuiButton-startIcon-373.MuiButton-iconSizeSmall-375 {
	margin-left: -2px;
}

.MuiButton-endIcon-374 {
	display: inherit;
	margin-left: 8px;
	margin-right: -4px;
}

.MuiButton-endIcon-374.MuiButton-iconSizeSmall-375 {
	margin-right: -2px;
}

.MuiButton-iconSizeSmall-375 > *:first-child {
	font-size: 18px;
}

.MuiButton-iconSizeMedium-376 > *:first-child {
	font-size: 20px;
}

.MuiButton-iconSizeLarge-377 > *:first-child {
	font-size: 22px;
}
.MuiButton-root-393 {
	color: rgba(0, 0, 0, 0.87);
	padding: 6px 19px;
	font-size: 0.875rem;
	min-width: 64px;
	box-sizing: border-box;
	transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
	font-family: Roboto;
	font-weight: 500;
	line-height: 1.45;
	border-radius: 4px;
	text-transform: uppercase;
}

.MuiButton-root-393:hover {
	text-decoration: none;
	background-color: rgba(0, 0, 0, 0.04);
}

.MuiButton-root-393.Mui-disabled {
	color: rgba(0, 0, 0, 0.26);
}

@media (hover: none) {
	.MuiButton-root-393:hover {
		background-color: transparent;
	}
}

.MuiButton-root-393:hover.Mui-disabled {
	background-color: transparent;
}

.MuiButton-label-394 {
	width: 100%;
	display: inherit;
	font-size: 16px;
	align-items: inherit;
	text-transform: initial;
	justify-content: inherit;
}

.MuiButton-text-395 {
	padding: 6px 8px;
}

.MuiButton-textPrimary-396 {
	color: #0053CC;
}

.MuiButton-textPrimary-396:hover {
	background-color: rgba(0, 83, 204, 0.04);
}

@media (hover: none) {
	.MuiButton-textPrimary-396:hover {
		background-color: transparent;
	}
}

.MuiButton-textSecondary-397 {
	color: #f44336;
}

.MuiButton-textSecondary-397:hover {
	background-color: rgba(244, 67, 54, 0.04);
}

@media (hover: none) {
	.MuiButton-textSecondary-397:hover {
		background-color: transparent;
	}
}

.MuiButton-outlined-398 {
	border: 1px solid rgba(0, 0, 0, 0.23);
	padding: 5px 18px;
}

.MuiButton-outlined-398.Mui-disabled {
	border: 1px solid rgba(0, 0, 0, 0.12);
}

.MuiButton-outlinedPrimary-399 {
	color: #0053CC;
	border: 1px solid rgba(0, 83, 204, 0.5);
}

.MuiButton-outlinedPrimary-399:hover {
	border: 1px solid #0053CC;
	background-color: rgba(0, 83, 204, 0.04);
}

@media (hover: none) {
	.MuiButton-outlinedPrimary-399:hover {
		background-color: transparent;
	}
}

.MuiButton-outlinedSecondary-400 {
	color: #f44336;
	border: 1px solid rgba(244, 67, 54, 0.5);
}

.MuiButton-outlinedSecondary-400:hover {
	border: 1px solid #f44336;
	background-color: rgba(244, 67, 54, 0.04);
}

.MuiButton-outlinedSecondary-400.Mui-disabled {
	border: 1px solid rgba(0, 0, 0, 0.26);
}

@media (hover: none) {
	.MuiButton-outlinedSecondary-400:hover {
		background-color: transparent;
	}
}

.MuiButton-contained-401 {
	color: rgba(0, 0, 0, 0.87);
	box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
	background-color: #e0e0e0;
}

.MuiButton-contained-401:hover {
	box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);
	background-color: #d5d5d5;
}

.MuiButton-contained-401.Mui-focusVisible {
	box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12);
}

.MuiButton-contained-401:active {
	box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12);
}

.MuiButton-contained-401.Mui-disabled {
	color: rgba(0, 0, 0, 0.26);
	box-shadow: none;
	background-color: rgba(0, 0, 0, 0.12);
}

@media (hover: none) {
	.MuiButton-contained-401:hover {
		box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
		background-color: #e0e0e0;
	}
}

.MuiButton-contained-401:hover.Mui-disabled {
	background-color: rgba(0, 0, 0, 0.12);
}

.MuiButton-containedPrimary-402 {
	color: #fff !important;
	background-color: #0053CC;
}

.MuiButton-containedPrimary-402:hover {
	background-color: #0044A8;
}

@media (hover: none) {
	.MuiButton-containedPrimary-402:hover {
		background-color: #0053CC;
	}
}

.MuiButton-containedSecondary-403 {
	color: #fff;
	background-color: #f44336;
}

.MuiButton-containedSecondary-403:hover {
	background-color: #d32f2f;
}

@media (hover: none) {
	.MuiButton-containedSecondary-403:hover {
		background-color: #f44336;
	}
}

.MuiButton-disableElevation-404 {
	box-shadow: none;
}

.MuiButton-disableElevation-404:hover {
	box-shadow: none;
}

.MuiButton-disableElevation-404.Mui-focusVisible {
	box-shadow: none;
}

.MuiButton-disableElevation-404:active {
	box-shadow: none;
}

.MuiButton-disableElevation-404.Mui-disabled {
	box-shadow: none;
}

.MuiButton-colorInherit-405 {
	color: inherit;
	border-color: currentColor;
}

.MuiButton-textSizeSmall-406 {
	padding: 4px 5px;
	font-size: 0.8125rem;
}

.MuiButton-textSizeLarge-407 {
	padding: 8px 11px;
	font-size: 0.9375rem;
}

.MuiButton-outlinedSizeSmall-408 {
	padding: 3px 9px;
	font-size: 0.8125rem;
}

.MuiButton-outlinedSizeLarge-409 {
	padding: 7px 21px;
	font-size: 0.9375rem;
}

.MuiButton-containedSizeSmall-410 {
	padding: 4px 10px;
	font-size: 0.8125rem;
}

.MuiButton-containedSizeLarge-411 {
	padding: 8px 22px;
	font-size: 0.9375rem;
}

.MuiButton-fullWidth-414 {
	width: 100%;
}

.MuiButton-startIcon-415 {
	display: inherit;
	margin-left: -4px;
	margin-right: 8px;
}

.MuiButton-startIcon-415.MuiButton-iconSizeSmall-417 {
	margin-left: -2px;
}

.MuiButton-endIcon-416 {
	display: inherit;
	margin-left: 8px;
	margin-right: -4px;
}

.MuiButton-endIcon-416.MuiButton-iconSizeSmall-417 {
	margin-right: -2px;
}

.MuiButton-iconSizeSmall-417 > *:first-child {
	font-size: 18px;
}

.MuiButton-iconSizeMedium-418 > *:first-child {
	font-size: 20px;
}

.MuiButton-iconSizeLarge-419 > *:first-child {
	font-size: 22px;
}
`
const mui4SynderFormLabel = `
.MuiFormLabel-root {
	color: #000;
	padding: 0;
	font-size: 16px;
	background: white;
	font-family: Roboto;
	font-weight: 400;
	line-height: 1;
	padding-right: 5px;
}

.MuiFormLabel-root.Mui-focused {
	color: #0053CC;
}

.MuiFormLabel-root.Mui-disabled {
	color: rgba(0, 0, 0, 0.38);
}

.MuiFormLabel-root.Mui-error {
	color: #f44336;
}

.MuiFormLabel-colorSecondary.Mui-focused {
	color: #f44336;
}

.MuiFormLabel-asterisk.Mui-error {
	color: #f44336;
}`

const mui4SynderInputLabel = `
.MuiInputLabel-root {
	display: block;
	font-size: 16px;
	font-style: normal;
	font-family: Roboto, sans-serif;
	font-weight: 500;
	font-stretch: normal;
	margin-bottom: 5px;
	transform-origin: top left;
}

.MuiInputLabel-formControl {
	top: 0;
	left: 0;
	position: absolute;
	transform: translate(0, 24px) scale(1);
}

.MuiInputLabel-marginDense {
	transform: translate(0, 21px) scale(1);
}

.MuiInputLabel-shrink {
	transform: translate(0, 1.5px) scale(0.75);
	transform-origin: top left;
}

.MuiInputLabel-animated {
	transition: color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms, transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms;
}

.MuiInputLabel-filled {
	z-index: 1;
	transform: translate(12px, 20px) scale(1);
	pointer-events: none;
}

.MuiInputLabel-filled.MuiInputLabel-marginDense {
	transform: translate(12px, 17px) scale(1);
}

.MuiInputLabel-filled.MuiInputLabel-shrink {
	transform: translate(12px, 10px) scale(0.75);
}

.MuiInputLabel-filled.MuiInputLabel-shrink.MuiInputLabel-marginDense {
	transform: translate(12px, 7px) scale(0.75);
}

.MuiInputLabel-outlined {
	z-index: 1;
	transform: translate(14px, 20px) scale(1);
	pointer-events: none;
}

.MuiInputLabel-outlined.MuiInputLabel-marginDense {
	transform: translate(14px, 12px) scale(1);
}

.MuiInputLabel-outlined.MuiInputLabel-shrink {
	transform: translate(14px, -6px) scale(0.75);
}
`
const mui4SynderFormHelperText = `
.MuiFormHelperText-root {
	color: rgba(0, 0, 0, 0.54);
	margin: 0;
	font-size: 14px;
	margin-top: 3px !important;
	text-align: left;
	font-family: Roboto;
	font-weight: 400;
	line-height: 1.66;
}

.MuiFormHelperText-root.Mui-disabled {
	color: rgba(0, 0, 0, 0.38);
}

.MuiFormHelperText-root.Mui-error {
	color: #f44336;
}

.MuiFormHelperText-marginDense {
	margin-top: 4px;
}

.MuiFormHelperText-contained {
	margin-left: 14px;
	margin-right: 14px;
}
`
const mui4SynderTabs = `
.MuiTabs-root {
	display: flex;
	overflow: hidden;
	min-height: 48px;
	-webkit-overflow-scrolling: touch;
}

.MuiTabs-vertical {
	flex-direction: column;
}

.MuiTabs-flexContainer {
	display: flex;
}

.MuiTabs-flexContainerVertical {
	flex-direction: column;
}

.MuiTabs-centered {
	justify-content: center;
}

.MuiTabs-scroller {
	flex: 1 1 auto;
	display: inline-block;
	position: relative;
	white-space: nowrap;
}

.MuiTabs-fixed {
	width: 100%;
	overflow-x: hidden;
}

.MuiTabs-scrollable {
	overflow-x: scroll;
	scrollbar-width: none;
}

.MuiTabs-scrollable::-webkit-scrollbar {
	display: none;
}

@media (max-width: 599.95px) {
	.MuiTabs-scrollButtonsDesktop {
		display: none;
	}
}
`
const mui4SynderTab = `
.MuiTab-root {
	padding: 6px 12px;
	overflow: hidden;
	position: relative;
	font-size: 0.875rem;
	max-width: 264px;
	min-width: 72px;
	box-sizing: border-box;
	min-height: 48px;
	text-align: center;
	flex-shrink: 0;
	font-family: Roboto;
	font-weight: 500;
	line-height: 1.75;
	white-space: normal;
	text-transform: uppercase;
}

@media (min-width: 600px) {
	.MuiTab-root {
		min-width: 160px;
	}
}

.MuiTab-labelIcon {
	min-height: 72px;
	padding-top: 9px;
}

.MuiTab-labelIcon .MuiTab-wrapper > *:first-child {
	margin-bottom: 6px;
}

.MuiTab-textColorInherit {
	color: inherit;
	opacity: 0.7;
}

.MuiTab-textColorInherit.Mui-selected {
	opacity: 1;
}

.MuiTab-textColorInherit.Mui-disabled {
	opacity: 0.5;
}

.MuiTab-textColorPrimary {
	color: rgba(0, 0, 0, 0.54);
}

.MuiTab-textColorPrimary.Mui-selected {
	color: #0053CC;
}

.MuiTab-textColorPrimary.Mui-disabled {
	color: rgba(0, 0, 0, 0.38);
}

.MuiTab-textColorSecondary {
	color: rgba(0, 0, 0, 0.54);
}

.MuiTab-textColorSecondary.Mui-selected {
	color: #f44336;
}

.MuiTab-textColorSecondary.Mui-disabled {
	color: rgba(0, 0, 0, 0.38);
}

.MuiTab-fullWidth {
	flex-grow: 1;
	max-width: none;
	flex-basis: 0;
	flex-shrink: 1;
}

.MuiTab-wrapped {
	font-size: 0.75rem;
	line-height: 1.5;
}

.MuiTab-wrapper {
	width: 100%;
	display: inline-flex;
	align-items: center;
	flex-direction: column;
	justify-content: center;
}
`
const mui4SynderLink = `
.footer-section-jss35 {
	text-decoration: none;
}

.footer-section-jss36 {
	color: #0053CC !important;
	text-decoration: none;
}

.footer-section-jss36:hover {
	text-decoration: underline;
}

.footer-section-jss37 {
	text-decoration: underline;
}

.footer-section-jss38 {
	border: 0;
	cursor: pointer;
	margin: 0;
	outline: 0;
	padding: 0;
	position: relative;
	user-select: none;
	border-radius: 0;
	vertical-align: middle;
	-moz-appearance: none;
	background-color: transparent;
	-webkit-appearance: none;
	-webkit-tap-highlight-color: transparent;
}

.footer-section-jss38::-moz-focus-inner {
	border-style: none;
}

.footer-section-jss38.footer-section-jss39 {
	outline: auto;
}
`

export const mui4Synder = {
	grid: mui4SynderGrid,
	typography: mui4SynderTypography,
	touchRipple: mui4SynderTouchRipple,
	buttonBase: mui4SynderButtonBase,
	formLabel: mui4SynderFormLabel,
	inputLabel: mui4SynderInputLabel,
	formHelperText: mui4SynderFormHelperText,
	tabs: mui4SynderTabs,
	tab: mui4SynderTab,
	link: mui4SynderLink,
}
