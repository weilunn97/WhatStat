import Modali, { useModali } from "modali";
import React from "react";
import step1 from "./guide/step1.jpg";
import step2 from "./guide/step2.jpg";
import step3 from "./guide/step3.jpg";
import step4 from "./guide/step4.jpg";
import step5 from "./guide/step5.jpg";

const HelpModal = props => {
  const toggleHelpModalOneTwo = () => {
    toggleHelpModalStepOne();
    toggleHelpModalStepTwo();
  };
  const toggleHelpModalTwoThree = () => {
    toggleHelpModalStepTwo();
    toggleHelpModalStepThree();
  };
  const toggleHelpModalThreeFour = () => {
    toggleHelpModalStepThree();
    toggleHelpModalStepFour();
  };
  const toggleHelpModalFourFive = () => {
    toggleHelpModalStepFour();
    toggleHelpModalStepFive();
  };

  const [helpModalStepOne, toggleHelpModalStepOne] = useModali({
    animated: true,
    centered: true,
    large: true,
    title: "1. 👋👋 Open up any ONE-ON-ONE 💬 on WhatsApp",
    buttons: [
      <Modali.Button isStyleDefault label=">" onClick={toggleHelpModalOneTwo} />
    ]
  });

  const [helpModalStepTwo, toggleHelpModalStepTwo] = useModali({
    animated: true,
    centered: true,
    large: true,
    title: "2. Skip this step if you're able to see all options. 😉",
    buttons: [
      <Modali.Button
        isStyleDefault
        label="<"
        onClick={toggleHelpModalOneTwo}
      />,
      <Modali.Button
        isStyleDefault
        label=">"
        onClick={toggleHelpModalTwoThree}
      />
    ]
  });

  const [helpModalStepThree, toggleHelpModalStepThree] = useModali({
    animated: true,
    centered: true,
    large: true,
    title: "3. Select the 'Export Chat' option",
    buttons: [
      <Modali.Button
        isStyleDefault
        label="<"
        onClick={toggleHelpModalTwoThree}
      />,
      <Modali.Button
        isStyleDefault
        label=">"
        onClick={toggleHelpModalThreeFour}
      />
    ]
  });

  const [helpModalStepFour, toggleHelpModalStepFour] = useModali({
    animated: true,
    centered: true,
    large: true,
    title: "4. No media is needed here 🤓",
    buttons: [
      <Modali.Button
        isStyleDefault
        label="<"
        onClick={toggleHelpModalThreeFour}
      />,
      <Modali.Button
        isStyleDefault
        label=">"
        onClick={toggleHelpModalFourFive}
      />
    ]
  });

  const [helpModalStepFive, toggleHelpModalStepFive] = useModali({
    animated: true,
    centered: true,
    large: true,
    title:
      "5. Send the exported text file to yourself, and press 'Upload' when you're ready! 🙂",
    buttons: [
      <Modali.Button
        isStyleDefault
        label="<"
        onClick={toggleHelpModalFourFive}
      />,
      <Modali.Button
        isStyleDefault
        label="Upload"
        onClick={props.uploadOverlayClickHandler}
      />
    ]
  });

  return (
    <div className="app">
      <button id="Main-help-button" onClick={toggleHelpModalStepOne} />
      <Modali.Modal {...helpModalStepOne}>
        <img alt="Step 1" src={step1} />
      </Modali.Modal>
      <Modali.Modal {...helpModalStepTwo}>
        <img alt="Step 2" src={step2} />
      </Modali.Modal>
      <Modali.Modal {...helpModalStepThree}>
        <img alt="Step 3" src={step3} />
      </Modali.Modal>
      <Modali.Modal {...helpModalStepFour}>
        <img alt="Step 4" src={step4} />
      </Modali.Modal>
      <Modali.Modal {...helpModalStepFive}>
        <img alt="Step 5" src={step5} />
      </Modali.Modal>
    </div>
  );
};

export default HelpModal;
