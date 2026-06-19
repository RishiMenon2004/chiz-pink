import { MouseEvent, ReactNode } from "react";

export default function ModalContainer( { onClose, children }: { onClose: (e: MouseEvent<HTMLButtonElement | HTMLDivElement>) => void, children: ReactNode } ) {
	return (<div className="modal-container" onClick={(e) => onClose(e)}>
		{children}
		<button className="close-btn" onClick={(e) => onClose(e)}/>
	</div>)
}