import "./App.css";
import "react-awesome-slider/dist/custom-animations/cube-animation.css";
import "react-awesome-slider/dist/styles.css";
import Analyzer from "./backend/Analyzer";
import AwesomeSlider from "react-awesome-slider";
import {css} from "@emotion/core";
import GridLoader from "react-spinners/GridLoader";
import Main from "./Main";
import MetricInterface from "./MetricInterface";
import React, {Component} from "react";

import bg1 from "./metric_bg/bg1.jpg";
import bg2 from "./metric_bg/bg2.jpg";
import bg3 from "./metric_bg/bg3.jpg";
import bg4 from "./metric_bg/bg4.jpg";
import bg5 from "./metric_bg/bg5.jpg";
import bg6 from "./metric_bg/bg6.jpg";

class App extends Component {
    state = {
        uploadedFile: null,
        rawText: null,
        analyzer: null,
        showHelp: true,
        showMain: true,
        showMetric: false
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!this.state.analyzer && this.state.rawText) {
            this.generateAnalyzer();
        } else if (!this.state.rawText && this.state.uploadedFile) {
            this.generateRawText();
        }
    }

    uploadOverlayClickHandler = ___ => {
        document.getElementById("App-upload-button").click();
    };

    uploadBtnClickHandler = event => {
        this.setState({
            uploadedFile: event.target.files[0]
        });
    };

    helpBtnClickHandler = _ => {
        this.setState({
            showHelp: true
        });
        document.getElementById("Main-help-button").click();
    };

    generateRawText = () => {
        const reader = new FileReader();
        reader.onload = (___ => {
            return e => {
                this.setState({
                    rawText: e.target.result
                });
            };
        })(reader);
        reader.readAsText(this.state.uploadedFile);
    };

    generateAnalyzer = async () => {
        const analyzer = new Analyzer(this.state.rawText);
        await analyzer.startPipeline();
        this.setState({
            analyzer: analyzer,
            showMetric: true,
            showMain: false,
        });
    };


    render() {
        if (this.state.analyzer && this.state.showMetric) {
            // DEBUG //
            // console.log(this.state.analyzer.sOneMsgCount);
            // console.log(this.state.analyzer.sOneWordCount);
            // console.log(this.state.analyzer.sOneWPMCount);
            // console.log(this.state.analyzer.sOneMediaCount);
            // console.log(this.state.analyzer.sOneAverageRT);
            // console.log(this.state.analyzer.sOneTimings);
            // console.log(this.state.analyzer.sOneDatetimes);
            //
            // console.log(this.state.analyzer.sTwoMsgCount);
            // console.log(this.state.analyzer.sTwoWordCount);
            // console.log(this.state.analyzer.sTwoWPMCount);
            // console.log(this.state.analyzer.sTwoMediaCount);
            // console.log(this.state.analyzer.sTwoAverageRT);
            // console.log(this.state.analyzer.sTwoTimings);
            // console.log(this.state.analyzer.sTwoDatetimes);
            // DEBUG //

            return (
                <div className="Metric">
                    <AwesomeSlider animation="cubeAnimation">
                        <div className="Metric-bg" data-src={bg1}>
                            <MetricInterface
                                index={"1"}
                                startDate={this.state.analyzer.startDate}
                                endDate={this.state.analyzer.endDate}
                                title={"Messages"}
                                sOne={this.state.analyzer.sOne}
                                sTwo={this.state.analyzer.sTwo}
                                sOneMetric={this.state.analyzer.sOneMsgCount}
                                sTwoMetric={this.state.analyzer.sTwoMsgCount}
                                sOneComment={this.state.analyzer.sOneMsgComment}
                                sTwoComment={this.state.analyzer.sTwoMsgComment}
                            />
                        </div>
                        <div className="Metric-bg" data-src={bg2}>
                            <MetricInterface
                                index={"2"}
                                startDate={this.state.analyzer.startDate}
                                endDate={this.state.analyzer.endDate}
                                title={"Words"}
                                sOne={this.state.analyzer.sOne}
                                sTwo={this.state.analyzer.sTwo}
                                sOneMetric={this.state.analyzer.sOneWordCount}
                                sTwoMetric={this.state.analyzer.sTwoWordCount}
                                sOneComment={this.state.analyzer.sOneWordComment}
                                sTwoComment={this.state.analyzer.sTwoWordComment}
                            />
                        </div>
                        <div className="Metric-bg" data-src={bg3}>
                            <MetricInterface
                                index={"3"}
                                startDate={this.state.analyzer.startDate}
                                endDate={this.state.analyzer.endDate}
                                title={"Words per message"}
                                sOne={this.state.analyzer.sOne}
                                sTwo={this.state.analyzer.sTwo}
                                sOneMetric={this.state.analyzer.sOneWPMCount}
                                sTwoMetric={this.state.analyzer.sTwoWPMCount}
                                sOneComment={this.state.analyzer.sOneWPMComment}
                                sTwoComment={this.state.analyzer.sTwoWPMComment}
                            />
                        </div>
                        <div className="Metric-bg" data-src={bg4}>
                            <MetricInterface
                                index={"4"}
                                startDate={this.state.analyzer.startDate}
                                endDate={this.state.analyzer.endDate}
                                title={"Media"}
                                sOne={this.state.analyzer.sOne}
                                sTwo={this.state.analyzer.sTwo}
                                sOneMetric={this.state.analyzer.sOneMediaCount}
                                sTwoMetric={this.state.analyzer.sTwoMediaCount}
                                sOneComment={this.state.analyzer.sOneMediaComment}
                                sTwoComment={this.state.analyzer.sTwoMediaComment}
                            />
                        </div>
                        <div className="Metric-bg" data-src={bg5}>
                            <MetricInterface
                                index={"7"}
                                startDate={this.state.analyzer.startDate}
                                endDate={this.state.analyzer.endDate}
                                title={"Average Reply Timing (Hours)"}
                                sOne={this.state.analyzer.sOne}
                                sTwo={this.state.analyzer.sTwo}
                                sOneMetric={this.state.analyzer.sOneAverageRT}
                                sTwoMetric={this.state.analyzer.sTwoAverageRT}
                                sOneComment={this.state.analyzer.sOneAverageRTComment}
                                sTwoComment={this.state.analyzer.sTwoAverageRTComment}
                            />
                        </div>
                        <div className="Metric-bg" data-src={bg6}>
                            <MetricInterface
                                graphing={true}
                                index={"8"}
                                startDate={this.state.analyzer.startDate}
                                endDate={this.state.analyzer.endDate}
                                title={"Reply Timing Chart"}
                                sOne={this.state.analyzer.sOne}
                                sTwo={this.state.analyzer.sTwo}
                                sOneDatetimes={this.state.analyzer.sOneDatetimes}
                                sOneTimings={this.state.analyzer.sOneTimings}
                                sTwoDatetimes={this.state.analyzer.sTwoDatetimes}
                                sTwoTimings={this.state.analyzer.sTwoTimings}
                            />
                        </div>
                    </AwesomeSlider>
                </div>
            );
        } else if (this.state.showMain) {
            // OVERRIDING CSS FOR HOMEPAGE
            const override = css`
                position: relative;
                margin: 0 auto;
                margin-left: 46vw;
                margin-top: -70vh;
                `;
            return (
                <div>
                    {/*DISPLAY HOMEPAGE*/}
                    <Main
                        uploadBtnClickHandler={this.uploadBtnClickHandler}
                        uploadOverlayClickHandler={this.uploadOverlayClickHandler}
                        helpBtnClickHandler={this.helpBtnClickHandler}
                        showHelp={this.state.showHelp}
                    />

                    {/*DISPLAY LOADING SPINNER*/}
                    {this.state.uploadedFile && (
                        <GridLoader
                            css={override}
                            size={30}
                            color={"#1B1464"}/>)}

                    {/*<GridLoader*/}
                    {/*    css={override}*/}
                    {/*    size={30}*/}
                    {/*    color={"#1B1464"}/>*/}
                </div>
            );
        }
    }
}

export default App;
